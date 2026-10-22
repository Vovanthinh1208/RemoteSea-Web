import type { SupportedLocale, TranslationParams } from "@/i18n/types";

type TranslationTree = Record<string, unknown>;

// Every src/i18n/locales/<locale>/<namespace>.json is bundled eagerly, so adding
// a namespace needs no code change here.
const modules = import.meta.glob<TranslationTree>("./locales/*/*.json", {
  eager: true,
  import: "default",
});

export const RESOURCES: Record<
  SupportedLocale,
  Record<string, TranslationTree>
> = { en: {}, vi: {} };

for (const [path, tree] of Object.entries(modules)) {
  const match = path.match(/locales\/(en|vi)\/([\w-]+)\.json$/);
  if (match) RESOURCES[match[1] as SupportedLocale][match[2]] = tree;
}

const getNestedValue = (obj: unknown, path: string[]): string | undefined => {
  let curr: unknown = obj;
  for (const seg of path) {
    if (!curr || typeof curr !== "object" || !(seg in curr)) {
      return undefined;
    }
    curr = (curr as Record<string, unknown>)[seg];
  }
  return typeof curr === "string" ? curr : undefined;
};

const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) return template;
  return template.replace(
    /\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g,
    (_, k1, k2) => {
      const key = k1 || k2;
      const val = params[key];
      return val !== undefined && val !== null ? String(val) : "";
    }
  );
};

const pluralCategory = (locale: SupportedLocale, count: number): string =>
  // Vietnamese has no grammatical plural; English distinguishes exactly one.
  locale === "en" && count === 1 ? "one" : "other";

/** Raw lookup in one locale: no plural selection, no fallback, no reporting. */
const lookup = (locale: SupportedLocale, key: string): string | undefined => {
  const parts = key.split(".");
  // A key that does not start with a known namespace lives in "common".
  return parts[0] in RESOURCES.en
    ? getNestedValue(RESOURCES[locale]?.[parts[0]], parts.slice(1))
    : getNestedValue(RESOURCES[locale]?.common, parts);
};

/** Whether `key` (or its plural variants) is defined for `locale`. */
export const hasTranslation = (locale: SupportedLocale, key: string): boolean =>
  lookup(locale, key) !== undefined ||
  lookup(locale, `${key}_other`) !== undefined;

// In development and tests a missing translation is reported instead of being
// hidden behind the English fallback: it is logged once and collected on
// globalThis.__I18N_MISSING__ so browser QA can assert on it. Production keeps
// the silent fallback so a gap never breaks the UI.
const REPORT_MISSING = import.meta.env.DEV || import.meta.env.MODE === "test";

const reportMissing = (locale: SupportedLocale, key: string): void => {
  if (!REPORT_MISSING) return;
  const g = globalThis as { __I18N_MISSING__?: Set<string> };
  g.__I18N_MISSING__ ??= new Set();
  const id = `${locale}:${key}`;
  if (g.__I18N_MISSING__.has(id)) return;
  g.__I18N_MISSING__.add(id);
  if (import.meta.env.DEV) console.warn(`[i18n] missing translation ${id}`);
};

export const resolveTranslation = (
  locale: SupportedLocale,
  key: string,
  params?: TranslationParams
): string => {
  // Plural variants: "<key>_one" / "<key>_other" selected by params.count
  if (typeof params?.count === "number" || typeof params?.n === "number") {
    const n = Number(params.count ?? params.n);
    const pluralKey = `${key}_${pluralCategory(locale, n)}`;
    if (lookup("en", pluralKey) !== undefined) {
      key = pluralKey;
    }
  }

  // 1. Target locale
  const targetVal = lookup(locale, key);
  if (targetVal !== undefined) return interpolate(targetVal, params);

  reportMissing(locale, key);

  // 2. English fallback
  if (locale !== "en") {
    const enVal = lookup("en", key);
    if (enVal !== undefined) return interpolate(enVal, params);
  }

  // 3. The key itself
  return key;
};
