// PB66 AC3.
export type CvRecommendation = "PROCEED" | "REVIEW" | "REJECT";

export type CvAnalysis = {
  id: string;
  fitScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestedQuestions: string[];
  // Decision support only — never rendered as if the AI made the call.
  // Null for analyses generated before this field existed (never
  // backfilled, see CvAnalysis's own schema comment on the backend).
  recommendation: CvRecommendation | null;
  recommendationReason: string | null;
  model: string;
  createdAt: string;
};
