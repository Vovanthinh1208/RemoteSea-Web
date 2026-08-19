import type {
  ScorecardDto,
  ScorecardListResponseDto,
} from "@/features/scorecards/scorecard.dto";
import type { Scorecard, ScorecardListResponse } from "@/types/scorecard";

export const toScorecard = (dto: ScorecardDto): Scorecard => dto;

export const toScorecardListResponse = (
  dto: ScorecardListResponseDto
): ScorecardListResponse => dto;
