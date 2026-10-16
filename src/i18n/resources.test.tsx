import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider, useTranslation } from "@/i18n";

type Tree = { [k: string]: string | Tree };

const flatten = (obj: Tree, prefix = ""): Record<string, string> =>
  Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    if (typeof v === "string") acc[prefix + k] = v;
    else Object.assign(acc, flatten(v, `${prefix}${k}.`));
    return acc;
  }, {});

const localeFiles = import.meta.glob<Tree>("./locales/*/*.json", {
  eager: true,
  import: "default",
});
const sourceFiles = import.meta.glob<string>("../**/*.{ts,tsx}", {
  eager: true,
  query: "?raw",
  import: "default",
});

const load = (locale: string) => {
  const out: Record<string, Record<string, string>> = {};
  for (const [file, tree] of Object.entries(localeFiles)) {
    const [, loc, name] = file.match(/locales\/(\w+)\/(\w+)\.json$/) ?? [];
    if (loc === locale) out[name] = flatten(tree);
  }
  return out;
};

const placeholders = (s: string) =>
  (s.match(/\{\{?\s*\w+\s*\}?\}/g) ?? [])
    .map((x) => x.replace(/[{}\s]/g, ""))
    .sort()
    .join(",");

describe("translation resources", () => {
  const en = load("en");
  const vi = load("vi");

  it("has the same namespaces, keys and placeholders in en and vi", () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
    for (const ns of Object.keys(en)) {
      expect(Object.keys(vi[ns]).sort(), ns).toEqual(
        Object.keys(en[ns]).sort()
      );
      for (const [k, v] of Object.entries(en[ns])) {
        expect(vi[ns][k].trim(), `${ns}.${k}`).not.toBe("");
        expect(placeholders(vi[ns][k]), `${ns}.${k}`).toBe(placeholders(v));
      }
    }
  });

  it("defines every literal t('...') key used in source", () => {
    const defined = new Set<string>();
    for (const [ns, keys] of Object.entries(en))
      for (const k of Object.keys(keys))
        defined.add(`${ns}.${k.replace(/_(one|other)$/, "")}`);

    const missing: string[] = [];
    for (const [file, src] of Object.entries(sourceFiles)) {
      if (/\.test\.|\/i18n\//.test(file)) continue;
      const ns = [
        ...src.matchAll(/useTranslation\(\s*["'](\w+)["']\s*\)/g),
      ].map((m) => m[1]);
      for (const m of src.matchAll(/\bt\(\s*["']([\w.]+)["']/g)) {
        const key = m[1];
        const candidates = [
          key,
          `common.${key}`,
          ...ns.map((n) => `${n}.${key}`),
        ];
        if (!candidates.some((c) => defined.has(c)))
          missing.push(`${file}: ${key}`);
      }
    }
    // Full keys stored in constants (e.g. { labelKey: "home.stats.jobsLive" })
    const nsPattern = new RegExp(
      `["']((?:${Object.keys(en).join("|")})\\.[A-Za-z0-9_.]+)["']`,
      "g"
    );
    for (const [file, src] of Object.entries(sourceFiles)) {
      if (/\.test\.|\/i18n\//.test(file)) continue;
      for (const m of src
        .replace(/^\s*(\/\/|\*).*$/gm, "")
        .matchAll(nsPattern)) {
        if (
          !defined.has(m[1]) &&
          ![...defined].some((d) => d.startsWith(`${m[1]}.`)) &&
          !/\.(tsx?|json|css|js)$/.test(m[1])
        )
          missing.push(`${file}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("hardcoded UI text guardrail", () => {
  // Brand names, sample people/companies in static marketing mocks, example
  // URLs/emails and format masks are intentionally not translated.
  const ALLOWED = new Set([
    "RemoteSEA",
    "Phạm Tuấn",
    "Finch Labs",
    "Jia Chen",
    "XXXXX-XXXXX",
    "Google",
    "GitHub",
    "LinkedIn",
    "Tiếng Việt",
    "English",
    "Cookies",
  ]);
  const looksTechnical = (v: string) =>
    /:\/\/|@|^[a-z0-9\-:./_]+$|^\+?[\d\s]+$/i.test(v) && !/\s/.test(v);

  const stripComments = (src: string) =>
    src
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  it("has no literal user-facing strings left in JSX props or text", () => {
    const offenders: string[] = [];
    const attr =
      /\b(placeholder|aria-label|alt|title)="([^"{}]*[A-Za-z\u00C0-\u1EF9]{2,}[^"{}]*)"/g;
    const text = />\s*([A-Z\u00C0-\u1EF9][^<>{}\n]{3,}?)\s*</g;
    for (const [file, raw] of Object.entries(sourceFiles)) {
      if (!file.endsWith(".tsx") || /\.test\.|\/i18n\//.test(file)) continue;
      const src = stripComments(raw);
      for (const m of src.matchAll(attr)) {
        const value = m[2];
        if (ALLOWED.has(value) || looksTechnical(value)) continue;
        // example URLs / emails used as input placeholders
        if (/^(https?:\/\/|[\w.]+@[\w.]+)/.test(value)) continue;
        offenders.push(`${file}: ${m[1]}="${value}"`);
      }
      for (const m of src.matchAll(text)) {
        const value = m[1].trim();
        if (ALLOWED.has(value) || /^[A-Z_]+$/.test(value)) continue;
        if (/=>|&&|\(|\bextends\b|^Promise$/.test(value)) continue;
        offenders.push(`${file}: >${value}<`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("hardcoded strings in feedback objects", () => {
  it("passes no literal copy to toast/title/description/label options", () => {
    const offenders: string[] = [];
    const prop =
      /\b(title|description|success|error|errorDescription|successDescription|confirmLabel|pendingLabel|notePlaceholder)\s*:\s*"([^"]*[A-Za-z\u00C0-\u1EF9]{3,}[^"]*)"/g;
    for (const [file, raw] of Object.entries(sourceFiles)) {
      if (/\.test\.|\/i18n\//.test(file)) continue;
      const src = raw
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      for (const m of src.matchAll(prop)) {
        const value = m[2];
        if (/^[a-z0-9\-_/.:]+$/.test(value) && !/\s/.test(value)) continue;
        // Tailwind class lists (e.g. badge variants) and console diagnostics
        if (/^[a-z0-9\-:[\]/.%_ ]+$/.test(value) && value.includes("-"))
          continue;
        const line = src.slice(src.lastIndexOf("\n", m.index) + 1, m.index);
        if (/console\./.test(line)) continue;
        offenders.push(`${file}: ${m[1]}: "${value}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("locale subscription", () => {
  // Components that render locale-dependent text through a runtime helper
  // (label maps, time/format utils, translate()) only re-render on a language
  // switch if they also subscribe to the i18n context.
  const LOCALE_HELPERS =
    /@\/utils\/(labels|time|format)"|@\/i18n\/(runtime|labels)"|@\/features\/(jobs|admin|employer|talent)\/[\w-]*\.utils"/;
  const SUBSCRIBES = /useTranslation|useI18n|useRevalidateOnLocaleChange/;
  const ALLOWED_WITHOUT = [
    "ErrorBoundary.tsx", // class component, reads the context via ErrorFallback
    "ErrorFallback",
    "AuthContext.tsx", // translates at event time (session-expired toast)
    "I18nContext.tsx", // the provider itself
  ];

  it("every component using locale-dependent helpers subscribes to the locale", () => {
    const offenders: string[] = [];
    for (const [file, src] of Object.entries(sourceFiles)) {
      if (!file.endsWith(".tsx") || /\.test\.|\/i18n\//.test(file)) continue;
      if (ALLOWED_WITHOUT.some((a) => file.includes(a))) continue;
      if (LOCALE_HELPERS.test(src) && !SUBSCRIBES.test(src))
        offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

describe("namespaced useTranslation", () => {
  const Probe = () => {
    const { t } = useTranslation("auth");
    return (
      <>
        <span data-testid="nested">{t("login.submit")}</span>
        <span data-testid="cross">{t("common.actions.save")}</span>
      </>
    );
  };

  it.each([
    ["en", "Sign in"],
    ["vi", "Đăng nhập"],
  ] as const)(
    "resolves nested keys inside the namespace (%s)",
    (locale, submit) => {
      render(
        <I18nProvider initialLocale={locale}>
          <Probe />
        </I18nProvider>
      );
      expect(screen.getByTestId("nested").textContent).toBe(submit);
      expect(screen.getByTestId("cross").textContent).not.toBe("common.save");
    }
  );
});
