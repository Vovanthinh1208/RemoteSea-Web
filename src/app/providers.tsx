import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { queryClient } from "@/core/query/query-client";
import { I18nProvider, useI18n, LOCALES_STORAGE_KEY } from "@/i18n";
import { useMyAccount } from "@/features/users/users.queries";

const I18nAccountSync = () => {
  const { user } = useAuth();
  const { data: account } = useMyAccount();
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    if (!user || !account?.language) return;
    try {
      const stored = localStorage.getItem(LOCALES_STORAGE_KEY);
      if (stored) return; // User's client selection has precedence

      const mapped = account.language === "Tiếng Việt" ? "vi" : "en";
      if (mapped !== locale) {
        setLocale(mapped);
      }
    } catch {
      // Ignore storage errors
    }
  }, [user, account?.language, locale, setLocale]);

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
