import type { SupportedLocale } from "@/i18n/types";

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

  if (locale === "vi") {
    if (diffSec < 60) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay === 1) return "Hôm qua";
    if (diffDay < 30) return `${diffDay} ngày trước`;
    if (diffMonth < 12) return `${diffMonth} tháng trước`;
    return `${diffYear} năm trước`;
  }

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 30) return `${diffDay}d ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
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

  if (locale === "vi") {
    const parts: string[] = [];
    if (years) parts.push(`${years} năm`);
    if (months) parts.push(`${months} tháng`);
    return parts.join(" ") || "< 1 tháng";
  }

  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} mo`);
  return parts.join(" ") || "< 1 mo";
};
