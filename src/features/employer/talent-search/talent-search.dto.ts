import type {
  TalentSearchItem,
  TalentSearchResponse,
} from "@/types/talent-search";
import type { ExperienceLevel } from "@/types/job";
import type {
  EmploymentType,
  NoticePeriod,
  TimezoneOverlap,
} from "@/types/talent";

// Wire-shape aliases — currently identical to the domain types (same rationale
// as employer.dto.ts: a future backend shape change only touches this file +
// talent-search.mapper.ts).
export type TalentSearchItemDto = TalentSearchItem;
export type TalentSearchResponseDto = TalentSearchResponse;

export type TalentSearchQueryParams = {
  q?: string;
  skills?: string[];
  level?: ExperienceLevel[];
  country?: string[];
  employmentTypes?: EmploymentType[];
  timezoneOverlap?: TimezoneOverlap[];
  noticePeriod?: NoticePeriod[];
  page: number;
  limit: number;
};
