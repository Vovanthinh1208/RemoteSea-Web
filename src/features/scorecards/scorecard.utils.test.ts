import { describe, expect, it } from "vitest";
import {
  breakdownByRecommendation,
  countEligibleReviewers,
  formatAverage,
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
  technicalRating: 4,
  communicationRating: 4,
  cultureFitRating: 4,
  strengths: null,
  improvements: null,
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
      STRONGLY_RECOMMEND: 0,
      RECOMMEND: 0,
      NEUTRAL: 0,
      NOT_RECOMMEND: 0,
      STRONGLY_NOT_RECOMMEND: 0,
    });
  });

  it("tallies each recommendation independently", () => {
    const scorecards = [
      makeScorecard("STRONGLY_RECOMMEND"),
      makeScorecard("RECOMMEND"),
      makeScorecard("RECOMMEND"),
      makeScorecard("NEUTRAL"),
      makeScorecard("NOT_RECOMMEND"),
    ];
    expect(breakdownByRecommendation(scorecards)).toEqual({
      STRONGLY_RECOMMEND: 1,
      RECOMMEND: 2,
      NEUTRAL: 1,
      NOT_RECOMMEND: 1,
      STRONGLY_NOT_RECOMMEND: 0,
    });
  });
});

describe("formatAverage", () => {
  it("shows one decimal, or a dash when missing", () => {
    expect(formatAverage(4)).toBe("4.0");
    expect(formatAverage(3.67)).toBe("3.7");
    expect(formatAverage(null)).toBe("–");
  });
});
