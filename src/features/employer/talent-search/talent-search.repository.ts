import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  TalentSearchQueryParams,
  TalentSearchResponseDto,
} from "@/features/employer/talent-search/talent-search.dto";

export const talentSearchRepository = {
  search: async (
    params: TalentSearchQueryParams,
    opts?: RequestOptions
  ): Promise<TalentSearchResponseDto> => {
    const { data } = await apiClient.get<TalentSearchResponseDto>("/talent", {
      params,
      signal: opts?.signal,
    });
    return data;
  },
};
