import React, { useEffect, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { queryClient } from "@/core/query/query-client";
import {
  I18nProvider,
  clearPendingLocaleSync,
  hasPendingLocaleSync,
  normalizeAccountLanguage,
  readStoredLocale,
  toAccountLanguage,
  useI18n,
} from "@/i18n";
import {
  useMyAccount,
  useUpdateMyAccount,
} from "@/features/users/users.queries";

/**
 * Keeps the UI language and the signed-in account's language preference in
 * agreement, in whichever direction is newer:
 * - a choice the user made that the account does not hold yet (picked while
 *   signed out, or a save that failed) is pushed to the account;
 * - otherwise the account preference is applied (e.g. set on another device).
 */
export const I18nAccountSync = () => {
  const { user } = useAuth();
  const { data: account } = useMyAccount();
  const { locale, setLocaleFromAccount } = useI18n();
  const { mutate: updateAccount } = useUpdateMyAccount();
  const saving = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !account) return;
    const accountLocale = normalizeAccountLanguage(account.language);

    if (hasPendingLocaleSync()) {
      // Decide only once an in-flight save has settled: its result changes the
      // account, which re-runs this effect. Clearing now could let that older
      // save win over a switch the user made in the meantime.
      if (saving.current !== null) return;
      if (accountLocale === locale) {
        clearPendingLocaleSync();
        return;
      }
      saving.current = locale;
      updateAccount(
        { language: toAccountLanguage(locale) },
        {
          // Only clear if the user has not switched again in the meantime.
          onSuccess: () => {
            if (readStoredLocale() === locale) clearPendingLocaleSync();
          },
          // On failure the choice stays pending and is retried on next load.
          onSettled: () => {
            saving.current = null;
          },
        }
      );
      return;
    }

    if (accountLocale && accountLocale !== locale) {
      setLocaleFromAccount(accountLocale);
    }
  }, [user, account, locale, setLocaleFromAccount, updateAccount]);

  return null;
};

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <I18nAccountSync />
            {children}
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
