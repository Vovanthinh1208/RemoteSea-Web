import type { SupportedLocale } from "@/i18n/types";
import { resolveTranslation } from "@/i18n/translate";

const getIntlLocale = (locale: SupportedLocale): string =>
  locale === "vi" ? "vi-VN" : "en-US";

export const formatDate = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale: SupportedLocale = "en"
): string => {
  const d = typeof date === "object" ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(d);
};

export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: SupportedLocale = "en"
): string => {
  if (typeof value !== "number" || isNaN(value)) return "0";
  return new Intl.NumberFormat(getIntlLocale(locale), options).format(value);
};

export const formatCurrency = (
  amount: number,
  currency?: string,
  locale: SupportedLocale = "en"
): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  const targetCurrency = currency || (locale === "vi" ? "VND" : "USD");
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: targetCurrency,
    maximumFractionDigits: targetCurrency === "VND" ? 0 : 2,
  }).format(amount);
};

export const formatRelativeTime = (
  date: Date | string | number,
  locale: SupportedLocale = "en"
): string => {
  const d = typeof date === "object" ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const tr = (key: string, n?: number) =>
    resolveTranslation(locale, `common.time.${key}`, { n });

  if (diffSec < 60) return tr("justNow");
  if (diffMin < 60) return tr("minuteAgo", diffMin);
  if (diffHour < 24) return tr("hourAgo", diffHour);
  if (diffDay === 1) return tr("yesterday");
  if (diffDay < 30) return tr("dayAgo", diffDay);
  if (diffMonth < 12) return tr("monthAgo", diffMonth);
  return tr("yearAgo", diffYear);
};

export const formatDurationLocale = (
  startIso: string,
  endIso: string | null,
  locale: SupportedLocale = "en"
): string => {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const totalMonths = Math.max(
    0,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      (end.getUTCMonth() - start.getUTCMonth())
  );
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const tr = (key: string, n?: number) =>
    resolveTranslation(locale, `common.format.${key}`, { n });
  const parts: string[] = [];
  if (years)
    parts.push(
      tr(years > 1 && locale === "en" ? "yearsOther" : "yearsOne", years)
    );
  if (months) parts.push(tr("months", months));
  return parts.join(" ") || tr("lessThanMonth");
};
