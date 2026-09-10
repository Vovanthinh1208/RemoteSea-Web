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

// Was defined identically in MatchBadge.tsx and AvailabilityBadge.tsx
// (both a 3-tier "how good is this" badge) — each used emerald-* for its
// top tier, a stock Tailwind hue outside this project's own brand/neutral/
// amber/danger scale (tailwind.config.ts), and the two badges commonly
// render on the same card (TalentCard, JobCard, PublicTalentProfilePage),
// so a candidate could carry two unrelated "emerald = best" signals at
// once. Both tiers now stay inside the brand-green family — "high" just
// darker/more saturated than "mid" — so hierarchy comes from shade, not a
// second hue.
export const TIER_BADGE_CLASS = {
  high: "border-brand-300 bg-brand-100 text-brand-900",
  mid: "border-brand-100 bg-brand-50 text-brand-700",
  low: "border-neutral-200 bg-neutral-100 text-neutral-500",
} as const;
