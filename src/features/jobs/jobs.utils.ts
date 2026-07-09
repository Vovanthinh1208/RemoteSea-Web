import { pickColorFromString } from "@/utils/color";
import { timeAgoShort } from "@/utils/time";

export { LEVEL_LABELS, JOB_TYPE_LABELS } from "@/utils/labels";

const COUNTRY_FLAGS: Record<string, string> = {
  Singapore: "🇸🇬",
  Vietnam: "🇻🇳",
  Australia: "🇦🇺",
  "United States": "🇺🇸",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
  Malaysia: "🇲🇾",
  Thailand: "🇹🇭",
};

const COMPANY_COLORS = [
  "#16a34a",
  "#5E6AD2",
  "#00C4CC",
  "#635BFF",
  "#EE4D2D",
  "#7C3AED",
  "#0EA5E9",
  "#B45309",
];

export const companyColor = (name: string): string => pickColorFromString(name, COMPANY_COLORS);

export const countryFlag = (country: string | null): string => {
  if (!country) return "🌏";
  return COUNTRY_FLAGS[country] ?? "🌏";
};

export const isAsyncTimezone = (timezone: string | null): boolean =>
  timezone?.toLowerCase().includes("async") ?? false;

export const MS_PER_DAY = 86_400_000;

export const timeAgo = timeAgoShort;
