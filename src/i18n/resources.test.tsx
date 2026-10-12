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
      for (const k of Object.keys(keys)) defined.add(`${ns}.${k}`);

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
    expect(missing).toEqual([]);
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
