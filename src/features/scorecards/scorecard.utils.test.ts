import { describe, expect, it } from "vitest";
import {
  breakdownByRecommendation,
  countEligibleReviewers,
} from "./scorecard.utils";
import type { Scorecard } from "@/types/scorecard";
import type { TeamMember } from "@/types/team";

const makeMember = (userId: string, role: TeamMember["role"]): TeamMember => ({
  id: `member-${userId}`,
  userId,
  role,
  createdAt: "2026-08-01T00:00:00.000Z",
  user: { name: userId, email: `${userId}@example.com` },
});

const makeScorecard = (
  recommendation: Scorecard["recommendation"]
): Scorecard => ({
  id: `sc-${Math.random()}`,
  authorId: "author",
  author: { name: "Author" },
  recommendation,
  note: null,
  createdAt: "2026-08-01T00:00:00.000Z",
});

describe("countEligibleReviewers", () => {
  const team = [
    makeMember("owner-1", "OWNER"),
    makeMember("recruiter-1", "RECRUITER"),
    makeMember("hm-1", "HIRING_MANAGER"),
    makeMember("interviewer-1", "INTERVIEWER"),
    makeMember("interviewer-2", "INTERVIEWER"),
  ];

  it("counts OWNER/RECRUITER/HIRING_MANAGER regardless of assignment", () => {
    expect(countEligibleReviewers(team, null)).toBe(3);
  });

  it("adds the assigned interviewer on top of the review-role members", () => {
    expect(countEligibleReviewers(team, "interviewer-1")).toBe(4);
  });

  it("doesn't double-count when the assigned interviewer is already a review-role member", () => {
    expect(countEligibleReviewers(team, "owner-1")).toBe(3);
  });

  it("doesn't count an unassigned INTERVIEWER-role member", () => {
    // interviewer-2 was never assigned to this interview, so they're not
    // eligible for this application even though they're on the team.
    expect(countEligibleReviewers(team, "interviewer-1")).not.toBe(5);
  });
});

describe("breakdownByRecommendation", () => {
  it("zero-fills every recommendation even with no scorecards", () => {
    expect(breakdownByRecommendation([])).toEqual({
      STRONG_YES: 0,
      YES: 0,
      NO: 0,
      STRONG_NO: 0,
    });
  });

  it("tallies each recommendation independently", () => {
    const scorecards = [
      makeScorecard("STRONG_YES"),
      makeScorecard("YES"),
      makeScorecard("YES"),
      makeScorecard("NO"),
    ];
    expect(breakdownByRecommendation(scorecards)).toEqual({
      STRONG_YES: 1,
      YES: 2,
      NO: 1,
      STRONG_NO: 0,
    });
  });
});
