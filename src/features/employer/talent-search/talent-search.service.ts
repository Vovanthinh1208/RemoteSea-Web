import type { RequestOptions } from "@/core/http/request-config";
import { talentSearchRepository } from "@/features/employer/talent-search/talent-search.repository";
import { toTalentSearchResponse } from "@/features/employer/talent-search/talent-search.mapper";
import type { TalentSearchQueryParams } from "@/features/employer/talent-search/talent-search.dto";
import type { TalentSearchFilters } from "@/features/employer/talent-search/talent-search.filters";
import type { TalentSearchResponse } from "@/types/talent-search";

export const buildTalentSearchParams = (
  query: TalentSearchFilters,
  limit: number
): TalentSearchQueryParams => ({
  q: query.q || undefined,
  skills: query.skills.length ? query.skills : undefined,
  level: query.level.length ? query.level : undefined,
  country: query.country.length ? query.country : undefined,
  employmentTypes: query.employmentTypes.length
    ? query.employmentTypes
    : undefined,
  timezoneOverlap: query.timezoneOverlap.length
    ? query.timezoneOverlap
    : undefined,
  page: query.page,
  limit,
});

export const searchTalent = async (
  query: TalentSearchFilters,
  limit: number,
  opts?: RequestOptions
): Promise<TalentSearchResponse> =>
  toTalentSearchResponse(
    await talentSearchRepository.search(
      buildTalentSearchParams(query, limit),
      opts
    )
  );
