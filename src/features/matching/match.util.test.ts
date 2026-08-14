import { describe, expect, it } from "vitest";
import {
  computeMatchScore,
  type MatchableJob,
  type MatchableTalent,
} from "./match.util";

const REACT = { id: "react", isRequired: true };
const TS = { id: "ts", isRequired: true };
const GRAPHQL = { id: "graphql", isRequired: false };

const talentSkill = (id: string) => ({ skill: { id } });

const baseJob: MatchableJob = {
  level: "SENIOR",
  salaryMin: 3000,
  salaryMax: 5000,
  currency: "USD",
  jobType: "FULL_TIME",
  timezone: "GMT+7 to +8",
  country: "Singapore",
  isRemote: true,
  skills: [
    { isRequired: true, skill: { id: REACT.id } },
    { isRequired: true, skill: { id: TS.id } },
    { isRequired: false, skill: { id: GRAPHQL.id } },
  ],
};

const baseTalent: MatchableTalent = {
  level: "SENIOR",
  desiredSalaryMin: 3000,
  desiredSalaryMax: 4500,
  currency: "USD",
  timezone: "GMT+7",
  country: "Vietnam",
  employmentTypes: ["FULL_TIME"],
  timezoneOverlap: ["SG_HOURS"],
  skills: [talentSkill(REACT.id), talentSkill(TS.id), talentSkill(GRAPHQL.id)],
};

describe("computeMatchScore", () => {
  it("scores a perfect match at 100 and caps reasons at 3, ranked by weight", () => {
    const { score, reasons } = computeMatchScore(baseJob, baseTalent);
    expect(score).toBe(100);
    // Salary (weight 15) qualifies too but loses the 3rd slot to location
    // (weight 20) — the cap keeps only the 3 highest-weighted qualifiers.
    expect(reasons).toEqual([
      "3/3 skills matched",
      "Strong experience match",
      "Timezone overlap",
    ]);
  });

  it("scores a total mismatch low with no reasons surfaced", () => {
    const job: MatchableJob = {
      level: "EXECUTIVE",
      salaryMin: 500,
      salaryMax: 1000,
      currency: "USD",
      jobType: "CONTRACT",
      timezone: "GMT+11",
      country: "Vietnam",
      isRemote: false,
      skills: [{ isRequired: true, skill: { id: "rust" } }],
    };
    const talent: MatchableTalent = {
      level: "ENTRY",
      desiredSalaryMin: 5000,
      desiredSalaryMax: 7000,
      currency: "USD",
      timezone: "GMT-5",
      country: "Australia",
      employmentTypes: ["FULL_TIME"],
      timezoneOverlap: [],
      skills: [talentSkill("react")],
    };

    const { score, reasons } = computeMatchScore(job, talent);
    expect(score).toBeLessThan(25);
    expect(reasons).toEqual([]);
  });

  it("falls back to neutral fractions instead of penalizing missing data", () => {
    const job: MatchableJob = {
      level: "MID",
      salaryMin: null,
      salaryMax: null,
      jobType: "FULL_TIME",
      timezone: null,
      country: null,
      isRemote: true,
      skills: [],
    };
    const talent: MatchableTalent = {
      level: "MID",
      timezone: null,
      country: "Vietnam",
      employmentTypes: [],
      timezoneOverlap: [],
      skills: [],
    };

    const { score, reasons } = computeMatchScore(job, talent);
    // Skills (nothing to mismatch) + seniority (exact level match) saturate;
    // salary/location/employment-type all sit at their neutral fallback.
    expect(score).toBe(82);
    expect(reasons).toEqual([
      "Skill requirements open",
      "Strong experience match",
    ]);
  });

  it("treats a currency mismatch as neutral rather than comparing raw numbers", () => {
    const job: MatchableJob = {
      ...baseJob,
      currency: "USD",
      salaryMin: 100,
      salaryMax: 200,
    };
    const talent: MatchableTalent = {
      ...baseTalent,
      currency: "VND",
      desiredSalaryMin: 20_000_000,
      desiredSalaryMax: 30_000_000,
    };

    const { reasons } = computeMatchScore(job, talent);
    expect(reasons).not.toContain("Salary within your range");
  });
});
