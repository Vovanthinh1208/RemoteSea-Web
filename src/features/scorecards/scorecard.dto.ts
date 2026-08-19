import type { Scorecard, ScorecardListResponse } from "@/types/scorecard";

export type ScorecardDto = Scorecard;
export type ScorecardListResponseDto = ScorecardListResponse;

export type CreateScorecardRequestDto = {
  recommendation: Scorecard["recommendation"];
  note?: string;
};
