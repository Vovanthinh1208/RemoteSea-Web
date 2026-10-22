import { useContext } from "react";
import { I18nContext } from "@/i18n/I18nContext";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "@/i18n/formatters";
import { getRuntimeLocale, setRuntimeLocale, translate } from "@/i18n/runtime";
import type { I18nContextValue } from "@/i18n/types";

// Used when a component renders outside <I18nProvider> (isolated tests, error
// boundaries mounted above the provider). It follows the last locale the
// provider published, defaulting to English, and cannot switch language.
const detachedValue = (): I18nContextValue => {
  const locale = getRuntimeLocale();
  return {
    locale,
    setLocale: setRuntimeLocale,
    setLocaleFromAccount: setRuntimeLocale,
    t: translate,
    formatDate: (date, options) => formatDate(date, options, locale),
    formatNumber: (value, options) => formatNumber(value, options, locale),
    formatCurrency: (amount, currency) =>
      formatCurrency(amount, currency, locale),
    formatRelativeTime: (date) => formatRelativeTime(date, locale),
  };
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  return context ?? detachedValue();
};
