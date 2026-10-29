import type { Scorecard, ScorecardRecommendation } from "@/types/scorecard";
import type { CompanyMemberRole, TeamMember } from "@/types/team";

const REVIEW_ROLES: ReadonlySet<CompanyMemberRole> = new Set([
  "OWNER",
  "RECRUITER",
  "HIRING_MANAGER",
]);

// PB64 AC4, strongest "for" to strongest "against".
export const SCORECARD_RECOMMENDATIONS: readonly ScorecardRecommendation[] = [
  "STRONGLY_RECOMMEND",
  "RECOMMEND",
  "NEUTRAL",
  "NOT_RECOMMEND",
  "STRONGLY_NOT_RECOMMEND",
];

// PB64 AC2's three criteria, in form/summary order.
export const SCORECARD_CRITERIA = [
  { field: "technicalRating", average: "technical" },
  { field: "communicationRating", average: "communication" },
  { field: "cultureFitRating", average: "cultureFit" },
] as const;

export const countEligibleReviewers = (
  teamMembers: TeamMember[],
  assignedInterviewerId: string | null | undefined
): number => {
  const reviewerIds = new Set(
    teamMembers.filter((m) => REVIEW_ROLES.has(m.role)).map((m) => m.userId)
  );
  if (assignedInterviewerId) reviewerIds.add(assignedInterviewerId);
  return reviewerIds.size;
};

export type RecommendationBreakdown = Record<ScorecardRecommendation, number>;

export const breakdownByRecommendation = (
  scorecards: Scorecard[]
): RecommendationBreakdown => {
  const breakdown = Object.fromEntries(
    SCORECARD_RECOMMENDATIONS.map((value) => [value, 0])
  ) as RecommendationBreakdown;
  for (const scorecard of scorecards) {
    breakdown[scorecard.recommendation] += 1;
  }
  return breakdown;
};

/** "4.3" / "–" for a 1–5 average that may be missing. */
export const formatAverage = (value: number | null): string =>
  value === null ? "–" : value.toFixed(1);
