import type { SupportedLocale } from "@/i18n/types";

export const LOCALES_STORAGE_KEY = "remotesea_locale";

// Set when the user picks a language and cleared once their account holds the
// same language. While it is set, the stored choice is the user's latest one
// and must not be overwritten by the (older) account preference — e.g. a
// language chosen before signing in, or a save that failed while offline.
export const LOCALE_PENDING_SYNC_KEY = "remotesea_locale_pending_sync";

export const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  value === "en" || value === "vi";

/** The account API stores the language as its display name. */
export const normalizeAccountLanguage = (
  value?: string | null
): SupportedLocale | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "tiếng việt" || normalized === "vi") return "vi";
  if (normalized === "english" || normalized === "en") return "en";
  return undefined;
};

export const toAccountLanguage = (locale: SupportedLocale): string =>
  locale === "vi" ? "Tiếng Việt" : "English";

// Web Storage throws (rather than returning null) when it is blocked, so every
// access degrades to "nothing stored".
export const readStoredLocale = (): SupportedLocale | null => {
  try {
    const stored = localStorage.getItem(LOCALES_STORAGE_KEY);
    return isSupportedLocale(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const writeStoredLocale = (
  locale: SupportedLocale,
  { pendingSync }: { pendingSync: boolean }
): void => {
  try {
    localStorage.setItem(LOCALES_STORAGE_KEY, locale);
    if (pendingSync) localStorage.setItem(LOCALE_PENDING_SYNC_KEY, "1");
  } catch {
    // The choice still applies for this session.
  }
};

export const hasPendingLocaleSync = (): boolean => {
  try {
    return localStorage.getItem(LOCALE_PENDING_SYNC_KEY) === "1";
  } catch {
    return false;
  }
};

export const clearPendingLocaleSync = (): void => {
  try {
    localStorage.removeItem(LOCALE_PENDING_SYNC_KEY);
  } catch {
    // Nothing to clear.
  }
};
