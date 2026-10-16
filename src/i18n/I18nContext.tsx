import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  I18nContextValue,
  SupportedLocale,
  TranslationParams,
} from "@/i18n/types";
import { resolveTranslation } from "@/i18n/translate";
import { setRuntimeLocale } from "@/i18n/runtime";
import { applyZodLocale } from "@/i18n/zod";
import {
  formatCurrency as fmtCurrency,
  formatDate as fmtDate,
  formatNumber as fmtNumber,
  formatRelativeTime as fmtRelativeTime,
} from "@/i18n/formatters";

export const LOCALES_STORAGE_KEY = "remotesea_locale";

const normalizeAccountLanguage = (
  val?: string | null
): SupportedLocale | undefined => {
  if (!val) return undefined;
  if (val === "Tiếng Việt" || val.toLowerCase() === "vi") return "vi";
  if (val === "English" || val.toLowerCase() === "en") return "en";
  return undefined;
};

const getInitialLocale = (accountLang?: string | null): SupportedLocale => {
  if (typeof window === "undefined") return "en";

  try {
    const stored = localStorage.getItem(LOCALES_STORAGE_KEY);
    if (stored === "vi" || stored === "en") return stored;

    const fromAccount = normalizeAccountLanguage(accountLang);
    if (fromAccount) return fromAccount;

    const navLang = navigator.language?.toLowerCase() || "";
    if (navLang.startsWith("vi")) return "vi";
  } catch {
    // LocalStorage access denied or unavailable
  }

  const fromAccount = normalizeAccountLanguage(accountLang);
  if (fromAccount) return fromAccount;

  return "en";
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
  accountLanguage?: string | null;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLocale,
  accountLanguage,
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (initialLocale) return initialLocale;
    return getInitialLocale(accountLanguage);
  });

  // Track if user explicitly selected a locale in this session
  const [hasExplicitSelection, setHasExplicitSelection] = useState(false);

  // Adjust during render pattern (React 19 recommended)
  const [prevAccountLanguage, setPrevAccountLanguage] =
    useState(accountLanguage);
  if (accountLanguage !== prevAccountLanguage) {
    setPrevAccountLanguage(accountLanguage);
    if (accountLanguage && !hasExplicitSelection) {
      const normalized = normalizeAccountLanguage(accountLanguage);
      if (normalized && normalized !== locale) {
        setLocaleState(normalized);
      }
    }
  }

  // Mirror the locale for non-React helpers (see runtime.ts) before children render
  setRuntimeLocale(locale);
  applyZodLocale(locale);

  // Keep <html lang="..."> attribute in sync
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    setHasExplicitSelection(true);

    try {
      localStorage.setItem(LOCALES_STORAGE_KEY, newLocale);
      window.dispatchEvent(
        new CustomEvent("remotesea_locale_change", { detail: newLocale })
      );
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams) =>
      resolveTranslation(locale, key, params),
    [locale]
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      fmtDate(date, options, locale),
    [locale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      fmtNumber(value, options, locale),
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, currency?: string) =>
      fmtCurrency(amount, currency, locale),
    [locale]
  );

  const formatRelativeTime = useCallback(
    (date: Date | string | number) => fmtRelativeTime(date, locale),
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
    }),
    [
      locale,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
    ]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
