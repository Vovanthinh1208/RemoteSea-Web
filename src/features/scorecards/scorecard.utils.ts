import type { Scorecard, ScorecardRecommendation } from "@/types/scorecard";
import type { CompanyMemberRole, TeamMember } from "@/types/team";

const REVIEW_ROLES: ReadonlySet<CompanyMemberRole> = new Set([
  "OWNER",
  "RECRUITER",
  "HIRING_MANAGER",
]);

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
  const breakdown: RecommendationBreakdown = {
    STRONG_YES: 0,
    YES: 0,
    NO: 0,
    STRONG_NO: 0,
  };
  for (const scorecard of scorecards) {
    breakdown[scorecard.recommendation] += 1;
  }
  return breakdown;
};
