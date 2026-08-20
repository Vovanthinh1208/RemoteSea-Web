import { describe, expect, it } from "vitest";
import {
  computeMatchScore,
  type MatchableJob,
  type MatchableTalent,
} from "./match.util";

const REACT = { id: "react", name: "React", isRequired: true };
const TS = { id: "ts", name: "TypeScript", isRequired: true };
const GRAPHQL = { id: "graphql", name: "GraphQL", isRequired: false };

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
    { isRequired: true, skill: { id: REACT.id, name: REACT.name } },
    { isRequired: true, skill: { id: TS.id, name: TS.name } },
    { isRequired: false, skill: { id: GRAPHQL.id, name: GRAPHQL.name } },
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
  noticePeriod: "Immediate",
};

describe("computeMatchScore", () => {
  it("scores a perfect match at 100 and caps reasons at 3, ranked by weight", () => {
    const { score, reasons } = computeMatchScore(baseJob, baseTalent);
    expect(score).toBe(100);
    // Salary (weight 10) and availability (weight 10) both qualify too but
    // lose the 3rd slot to location (weight 20) — the cap keeps only the 3
    // highest-weighted qualifiers.
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
      skills: [{ isRequired: true, skill: { id: "rust", name: "Rust" } }],
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

  it("lists missing skills required-first, omitting ones the talent already has", () => {
    const talent: MatchableTalent = {
      ...baseTalent,
      skills: [talentSkill(TS.id)],
    };
    const { missingSkills } = computeMatchScore(baseJob, talent);
    expect(missingSkills).toEqual([
      { id: REACT.id, name: REACT.name, isRequired: true },
      { id: GRAPHQL.id, name: GRAPHQL.name, isRequired: false },
    ]);
  });

  it("reports no missing skills once every job skill is covered", () => {
    const { missingSkills } = computeMatchScore(baseJob, baseTalent);
    expect(missingSkills).toEqual([]);
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
    // salary/location/employment-type/availability all sit at their neutral
    // fallback (0.6): round(30 + 20 + 10*0.6 + 20*0.6 + 10*0.6 + 10*0.6) = 80.
    expect(score).toBe(80);
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

  it("surfaces an 'available immediately' reason for Immediate notice", () => {
    // baseJob/baseTalent already saturate skills+seniority+location, leaving
    // no room in the top-3 cap for availability to prove it's counted at
    // all — so this reuses the neutral-fallback fixture instead, where only
    // skills/seniority qualify and availability legitimately claims the 3rd slot.
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
      noticePeriod: "Immediate",
    };

    const { reasons } = computeMatchScore(job, talent);
    expect(reasons).toEqual([
      "Skill requirements open",
      "Strong experience match",
      "Available immediately",
    ]);
  });

  it("does not surface an availability reason for a long notice period", () => {
    const { score, reasons } = computeMatchScore(baseJob, {
      ...baseTalent,
      noticePeriod: "2+ months",
    });
    expect(reasons).not.toContain("Available immediately");
    expect(reasons).not.toContain("Available soon");
    // Every other component still saturates at 1 (baseJob/baseTalent are
    // otherwise a perfect match); availability alone drops to 0.25:
    // round(30 + 20 + 10 + 20 + 10 + 10*0.25) = round(92.5) = 93.
    expect(score).toBe(93);
  });
});
