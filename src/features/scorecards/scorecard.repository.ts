import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CreateScorecardRequestDto,
  ScorecardDto,
  ScorecardListResponseDto,
} from "@/features/scorecards/scorecard.dto";

// Employer-only — unlike interview.repository.ts's role-branching path,
// there's no talent-side route: scorecards are internal company feedback,
// never shown to the talent.
export const scorecardRepository = {
  list: async (
    applicationId: string,
    opts?: RequestOptions
  ): Promise<ScorecardListResponseDto> => {
    const { data } = await apiClient.get<ScorecardListResponseDto>(
      `/employer/applications/${applicationId}/scorecards`,
      { signal: opts?.signal }
    );
    return data;
  },

  create: async (
    applicationId: string,
    body: CreateScorecardRequestDto
  ): Promise<ScorecardDto> => {
    const { data } = await apiClient.post<ScorecardDto>(
      `/employer/applications/${applicationId}/scorecards`,
      body
    );
    return data;
  },
};
