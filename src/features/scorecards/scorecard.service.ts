import type { RequestOptions } from "@/core/http/request-config";
import { scorecardRepository } from "@/features/scorecards/scorecard.repository";
import {
  toScorecard,
  toScorecardListResponse,
} from "@/features/scorecards/scorecard.mapper";
import type {
  CreateScorecardPayload,
  Scorecard,
  ScorecardListResponse,
} from "@/types/scorecard";

export const getScorecards = async (
  applicationId: string,
  opts?: RequestOptions
): Promise<ScorecardListResponse> =>
  toScorecardListResponse(await scorecardRepository.list(applicationId, opts));

export const createScorecard = async (
  applicationId: string,
  payload: CreateScorecardPayload
): Promise<Scorecard> =>
  toScorecard(await scorecardRepository.create(applicationId, payload));
