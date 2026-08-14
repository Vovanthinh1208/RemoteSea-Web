import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchTalent } from "@/features/employer/talent-search/talent-search.service";
import {
  TALENT_SEARCH_LIMIT,
  type TalentSearchFilters,
} from "@/features/employer/talent-search/talent-search.filters";
import { talentSearchKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

export const useTalentSearchQuery = (
  filters: TalentSearchFilters,
  limit: number = TALENT_SEARCH_LIMIT
) =>
  useQuery({
    queryKey: talentSearchKeys.list(filters, limit),
    queryFn: ({ signal }) => searchTalent(filters, limit, { signal }),
    placeholderData: keepPreviousData,
    ...TIER.list,
  });
