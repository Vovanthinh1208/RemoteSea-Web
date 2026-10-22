export type SupportedLocale = "en" | "vi";

export type TranslationParams = Record<
  string,
  string | number | undefined | null
>;

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  setLocaleFromAccount: (locale: SupportedLocale) => void;
  t: (key: string, params?: TranslationParams) => string;
  formatDate: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: Date | string | number) => string;
}
