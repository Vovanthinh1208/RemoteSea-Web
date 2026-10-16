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

export const resolveTranslation = (
  locale: SupportedLocale,
  key: string,
  params?: TranslationParams
): string => {
  // Plural variants: "<key>_one" / "<key>_other" selected by params.count
  if (
    !params?.__plural &&
    (typeof params?.count === "number" || typeof params?.n === "number")
  ) {
    const n = Number(params.count ?? params.n);
    const pluralKey = `${key}_${pluralCategory(locale, n)}`;
    const resolved = resolveTranslation(locale, pluralKey, {
      ...params,
      __plural: 1,
    });
    if (resolved !== pluralKey) return resolved;
  }

  const parts = key.split(".");
  let ns = parts[0];
  let subPath = parts.slice(1);

  // If key does not start with a known namespace, default to "common"
  if (!(ns in RESOURCES.en)) {
    ns = "common";
    subPath = parts;
  }

  // 1. Try target locale
  const targetDict = RESOURCES[locale]?.[ns];
  const targetVal = getNestedValue(targetDict, subPath);
  if (targetVal !== undefined) {
    return interpolate(targetVal, params);
  }

  // 2. Fallback to English
  if (locale !== "en") {
    const enDict = RESOURCES.en?.[ns];
    const enVal = getNestedValue(enDict, subPath);
    if (enVal !== undefined) {
      return interpolate(enVal, params);
    }
  }

  // 3. Fallback: return key
  return key;
};
