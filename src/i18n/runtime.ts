import type { SupportedLocale, TranslationParams } from "@/i18n/types";
import { resolveTranslation } from "@/i18n/translate";

/**
 * Locale snapshot for code that runs outside React (utils, API error mapping,
 * toasts fired from mutations). I18nProvider writes it synchronously during
 * render, so any component that re-renders because the locale changed reads
 * the new value from these helpers. Components should still prefer
 * `useTranslation()`; this exists so shared utilities don't need a locale arg
 * threaded through every call site.
 */
let current: SupportedLocale = "en";

export const setRuntimeLocale = (locale: SupportedLocale): void => {
  current = locale;
};

export const getRuntimeLocale = (): SupportedLocale => current;

export const translate = (key: string, params?: TranslationParams): string =>
  resolveTranslation(current, key, params);

export const getIntlLocale = (locale: SupportedLocale = current): string =>
  locale === "vi" ? "vi-VN" : "en-US";
