import type { ExperienceLevel } from "@/types/job";
import type {
  EmploymentType,
  NoticePeriod,
  TimezoneOverlap,
} from "@/types/talent";

export const TALENT_SEARCH_LIMIT = 12;

export const LEVEL_OPTIONS: ExperienceLevel[] = [
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
];

export const EMPLOYMENT_TYPE_OPTIONS: EmploymentType[] = [
  "FULL_TIME",
  "CONTRACT",
  "PART_TIME",
];

export const TIMEZONE_OVERLAP_OPTIONS: TimezoneOverlap[] = [
  "SG_HOURS",
  "AU_HOURS",
  "ASYNC_ONLY",
];

export const COUNTRY_OPTIONS = [
  "Vietnam",
  "Singapore",
  "Indonesia",
  "Philippines",
  "Malaysia",
  "Thailand",
];

export type TalentSearchFilters = {
  q: string;
  skills: string[];
  level: ExperienceLevel[];
  country: string[];
  employmentTypes: EmploymentType[];
  timezoneOverlap: TimezoneOverlap[];
  noticePeriod: NoticePeriod[];
  page: number;
  // Employer's own job to rank/badge the current page's results against —
  // client-side only (see match.util.ts), never sent to GET /talent.
  forJob: string | undefined;
};

export const DEFAULT_TALENT_SEARCH_FILTERS: TalentSearchFilters = {
  q: "",
  skills: [],
  level: [],
  country: [],
  employmentTypes: [],
  timezoneOverlap: [],
  noticePeriod: [],
  page: 1,
  forJob: undefined,
};

const toArray = <T extends string>(values: string[]): T[] => values as T[];

export const parseTalentSearchQuery = (
  params: URLSearchParams
): TalentSearchFilters => ({
  q: params.get("q") ?? "",
  skills: params.getAll("skill"),
  level: toArray<ExperienceLevel>(params.getAll("level")),
  country: params.getAll("country"),
  employmentTypes: toArray<EmploymentType>(params.getAll("type")),
  timezoneOverlap: toArray<TimezoneOverlap>(params.getAll("tz")),
  noticePeriod: toArray<NoticePeriod>(params.getAll("notice")),
  page: Math.max(1, Number(params.get("page")) || 1),
  forJob: params.get("forJob") ?? undefined,
});

export const serializeTalentSearchQuery = (
  query: TalentSearchFilters
): string => {
  const p = new URLSearchParams();
  if (query.q) p.set("q", query.q);
  query.skills.forEach((v) => p.append("skill", v));
  query.level.forEach((v) => p.append("level", v));
  query.country.forEach((v) => p.append("country", v));
  query.employmentTypes.forEach((v) => p.append("type", v));
  query.timezoneOverlap.forEach((v) => p.append("tz", v));
  query.noticePeriod.forEach((v) => p.append("notice", v));
  if (query.page > 1) p.set("page", String(query.page));
  if (query.forJob) p.set("forJob", query.forJob);
  return p.toString();
};

export const countActiveTalentFilters = (
  filters: TalentSearchFilters
): number =>
  filters.skills.length +
  filters.level.length +
  filters.country.length +
  filters.employmentTypes.length +
  filters.timezoneOverlap.length +
  filters.noticePeriod.length;
