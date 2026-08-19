export type ScorecardRecommendation = "STRONG_YES" | "YES" | "NO" | "STRONG_NO";

export type Scorecard = {
  id: string;
  authorId: string;
  author: { name: string | null };
  recommendation: ScorecardRecommendation;
  note: string | null;
  createdAt: string;
};

export type ScorecardSummary = { total: number; hireCount: number };

export type ScorecardListResponse = {
  scorecards: Scorecard[];
  summary: ScorecardSummary;
};

export type CreateScorecardPayload = {
  recommendation: ScorecardRecommendation;
  note?: string;
};
