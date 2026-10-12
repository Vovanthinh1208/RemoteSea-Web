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
import {
  formatCurrency as fmtCurrency,
  formatDate as fmtDate,
  formatNumber as fmtNumber,
  formatRelativeTime as fmtRelativeTime,
} from "@/i18n/formatters";

// Static locale dictionaries
import enCommon from "@/i18n/locales/en/common.json";
import enAuth from "@/i18n/locales/en/auth.json";
import enTalent from "@/i18n/locales/en/talent.json";
import enEmployer from "@/i18n/locales/en/employer.json";
import enJobs from "@/i18n/locales/en/jobs.json";
import enSettings from "@/i18n/locales/en/settings.json";
import enAdmin from "@/i18n/locales/en/admin.json";
import enAi from "@/i18n/locales/en/ai.json";

import viCommon from "@/i18n/locales/vi/common.json";
import viAuth from "@/i18n/locales/vi/auth.json";
import viTalent from "@/i18n/locales/vi/talent.json";
import viEmployer from "@/i18n/locales/vi/employer.json";
import viJobs from "@/i18n/locales/vi/jobs.json";
import viSettings from "@/i18n/locales/vi/settings.json";
import viAdmin from "@/i18n/locales/vi/admin.json";
import viAi from "@/i18n/locales/vi/ai.json";

export const LOCALES_STORAGE_KEY = "remotesea_locale";

type TranslationTree = Record<string, unknown>;

const RESOURCES: Record<SupportedLocale, Record<string, TranslationTree>> = {
  en: {
    common: enCommon,
    auth: enAuth,
    talent: enTalent,
    employer: enEmployer,
    jobs: enJobs,
    settings: enSettings,
    admin: enAdmin,
    ai: enAi,
  },
  vi: {
    common: viCommon,
    auth: viAuth,
    talent: viTalent,
    employer: viEmployer,
    jobs: viJobs,
    settings: viSettings,
    admin: viAdmin,
    ai: viAi,
  },
};

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

const resolveTranslation = (
  locale: SupportedLocale,
  key: string,
  params?: TranslationParams
): string => {
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
