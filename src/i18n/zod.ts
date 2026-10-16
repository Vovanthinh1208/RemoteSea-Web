import { z } from "zod";
import { translate } from "@/i18n/runtime";
import type { SupportedLocale } from "@/i18n/types";
import type { TranslationParams } from "@/i18n/types";

/**
 * Zod message helpers. Schemas are module-level constants, so a literal string
 * would freeze the language at import time. Zod 4 evaluates `error` callbacks
 * at parse time, so these resolve through the active locale on every
 * validation run.
 *
 *   z.string().min(1, m("validation.nameRequired"))
 *   z.refine(fn, { error: v("validation.endBeforeStart"), path: [...] })
 */
export const v = (key: string, params?: TranslationParams) => () =>
  translate(key, params);

export const m = (key: string, params?: TranslationParams) => ({
  error: v(key, params),
});

/** Localizes zod's built-in messages (min/max/type errors without a custom text). */
export const applyZodLocale = (locale: SupportedLocale): void => {
  z.config(locale === "vi" ? z.locales.vi() : z.locales.en());
};
