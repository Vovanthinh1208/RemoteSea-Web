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
import { applyDefaultDocumentMeta } from "@/i18n/document-meta";
import {
  formatCurrency as fmtCurrency,
  formatDate as fmtDate,
  formatNumber as fmtNumber,
  formatRelativeTime as fmtRelativeTime,
} from "@/i18n/formatters";
import {
  LOCALES_STORAGE_KEY,
  hasPendingLocaleSync,
  isSupportedLocale,
  normalizeAccountLanguage,
  readStoredLocale,
  writeStoredLocale,
} from "@/i18n/locale-storage";

// Resolution order: a choice not yet saved to the account (the latest one) →
// the account preference → the stored choice → the browser language → English.
const getInitialLocale = (accountLang?: string | null): SupportedLocale => {
  if (typeof window === "undefined") return "en";

  const stored = readStoredLocale();
  if (stored && hasPendingLocaleSync()) return stored;

  const fromAccount = normalizeAccountLanguage(accountLang);
  if (fromAccount) return fromAccount;

  if (stored) return stored;

  const navLang = navigator.language?.toLowerCase() || "";
  if (navLang.startsWith("vi")) return "vi";

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
    if (isSupportedLocale(initialLocale)) return initialLocale;
    return getInitialLocale(accountLanguage);
  });

  // Track if user explicitly selected a locale in this session
  const [hasExplicitSelection, setHasExplicitSelection] = useState(false);

  // Adjust during render pattern (React 19 recommended)
  const [prevAccountLanguage, setPrevAccountLanguage] =
    useState(accountLanguage);
  if (accountLanguage !== prevAccountLanguage) {
    setPrevAccountLanguage(accountLanguage);
    if (accountLanguage && !hasExplicitSelection && !hasPendingLocaleSync()) {
      const normalized = normalizeAccountLanguage(accountLanguage);
      if (normalized && normalized !== locale) {
        setLocaleState(normalized);
      }
    }
  }

  // Mirror the locale for non-React helpers (see runtime.ts) before children render
  setRuntimeLocale(locale);
  applyZodLocale(locale);

  // Keep <html lang="..."> and the default title/meta in sync. Child effects run
  // first, so a page that sets its own title (useDocumentTitle) keeps it.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      applyDefaultDocumentMeta();
    }
  }, [locale]);

  // A choice the user made: it wins over the account preference until the
  // account holds the same language (see I18nAccountSync).
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (!isSupportedLocale(newLocale)) return;
    setLocaleState(newLocale);
    setHasExplicitSelection(true);
    writeStoredLocale(newLocale, { pendingSync: true });
    window.dispatchEvent(
      new CustomEvent("remotesea_locale_change", { detail: newLocale })
    );
  }, []);

  // The account preference: ignored while a newer user choice exists.
  const setLocaleFromAccount = useCallback(
    (newLocale: SupportedLocale) => {
      if (!isSupportedLocale(newLocale)) return;
      if (hasExplicitSelection || hasPendingLocaleSync()) return;
      setLocaleState(newLocale);
      writeStoredLocale(newLocale, { pendingSync: false });
    },
    [hasExplicitSelection]
  );

  // A selection made in another tab is the latest user choice for this tab.
  // That tab already wrote storage, so only adopt it here (no write-back).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOCALES_STORAGE_KEY) return;
      if (isSupportedLocale(event.newValue)) {
        setLocaleState(event.newValue);
        setHasExplicitSelection(true);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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
      setLocaleFromAccount,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
    }),
    [
      locale,
      setLocale,
      setLocaleFromAccount,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
    ]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
