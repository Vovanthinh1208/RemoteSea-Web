// PB64 AC4's five-point recommendation scale.
export type ScorecardRecommendation =
  | "STRONGLY_RECOMMEND"
  | "RECOMMEND"
  | "NEUTRAL"
  | "NOT_RECOMMEND"
  | "STRONGLY_NOT_RECOMMEND";

export type Scorecard = {
  id: string;
  authorId: string;
  author: { name: string | null };
  recommendation: ScorecardRecommendation;
  // PB64 AC2–3 — null only on scorecards submitted before these existed.
  technicalRating: number | null;
  communicationRating: number | null;
  cultureFitRating: number | null;
  strengths: string | null;
  improvements: string | null;
  note: string | null;
  createdAt: string;
};

// PB65 AC2: per-criterion means and the overall mean (1 decimal), null when
// no scorecard carries that rating.
export type ScorecardAverages = {
  technical: number | null;
  communication: number | null;
  cultureFit: number | null;
  overall: number | null;
};

export type ScorecardSummary = {
  total: number;
  hireCount: number;
  averages: ScorecardAverages;
  recommendations: Record<ScorecardRecommendation, number>;
};

export type ScorecardListResponse = {
  scorecards: Scorecard[];
  summary: ScorecardSummary;
};

export type CreateScorecardPayload = {
  technicalRating: number;
  communicationRating: number;
  cultureFitRating: number;
  strengths: string;
  improvements: string;
  recommendation: ScorecardRecommendation;
  note?: string;
};
