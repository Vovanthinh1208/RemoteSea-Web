export const pickColorFromString = (
  value: string,
  palette: readonly string[]
): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash += value.charCodeAt(i);
  return palette[hash % palette.length];
};

// Lived in features/jobs/jobs.utils, but talent, post-job, and the home page
// all imported it cross-feature — a company-brand color is app-wide, not a
// jobs concern. jobs.utils re-exports for existing imports.
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

export const companyColor = (name: string): string =>
  pickColorFromString(name, COMPANY_COLORS);

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

export const countryFlag = (country: string | null): string => {
  if (!country) return "🌏";
  return COUNTRY_FLAGS[country] ?? "🌏";
};
