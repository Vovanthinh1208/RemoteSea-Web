// Rule-based talent <-> job match score, computed entirely client-side (see
// the plan notes on GET /jobs being a shared CDN-cached response — attaching
// a personalized score there would silently break that cache). Consumed by
// JobCard/MatchCard (talent's own % on a job) and ApplicantsPanel (employer
// ranking a job's applicants) — same function, different callers, since both
// sides already have everything the function needs in data they fetch anyway.

export interface MatchableJob {
  level: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency?: string;
  jobType: string;
  timezone: string | null;
  country: string | null;
  isRemote: boolean;
  skills: { isRequired: boolean; skill: { id: string } }[];
}

export interface MatchableTalent {
  level: string;
  desiredSalaryMin?: number | null;
  desiredSalaryMax?: number | null;
  currency?: string;
  timezone: string | null;
  country: string | null;
  employmentTypes: string[];
  timezoneOverlap: string[];
  skills: { skill: { id: string } }[];
}

export interface MatchResult {
  score: number;
  reasons: string[];
}

const WEIGHTS = {
  skills: 35,
  seniority: 20,
  salary: 15,
  location: 20,
  employmentType: 10,
} as const;

// Component fractions ≥ this surface a "why it matches" reason — below it,
// the component contributed to the score but isn't worth calling out.
const REASON_THRESHOLD = 0.7;

const LEVEL_ORDER: Record<string, number> = {
  ENTRY: 0,
  MID: 1,
  SENIOR: 2,
  LEAD: 3,
  EXECUTIVE: 4,
};

// UTC-offset countries a talent's stated timezone-overlap preference maps
// to — mirrors remotesea-api's job-search.util.ts TZ_COUNTRY (no shared
// package between the two projects, so this small map is duplicated rather
// than imported).
const TIMEZONE_OVERLAP_COUNTRY: Record<string, string> = {
  SG_HOURS: "Singapore",
  AU_HOURS: "Australia",
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const scoreSkills = (job: MatchableJob, talent: MatchableTalent) => {
  if (job.skills.length === 0) return { fraction: 1, matched: 0, total: 0 };

  const talentSkillIds = new Set(talent.skills.map((s) => s.skill.id));
  const required = job.skills.filter((s) => s.isRequired);
  const optional = job.skills.filter((s) => !s.isRequired);

  const fractionOf = (skills: typeof job.skills) =>
    skills.length
      ? skills.filter((s) => talentSkillIds.has(s.skill.id)).length /
        skills.length
      : 1;

  const requiredFraction = fractionOf(required);
  const optionalFraction = fractionOf(optional);
  const fraction = required.length
    ? 0.8 * requiredFraction + 0.2 * optionalFraction
    : optionalFraction;

  const matched = job.skills.filter((s) =>
    talentSkillIds.has(s.skill.id)
  ).length;
  return { fraction, matched, total: job.skills.length };
};

const scoreSeniority = (job: MatchableJob, talent: MatchableTalent) => {
  const jobIndex = LEVEL_ORDER[job.level] ?? LEVEL_ORDER.MID!;
  const talentIndex = LEVEL_ORDER[talent.level] ?? LEVEL_ORDER.MID!;
  const diff = Math.abs(talentIndex - jobIndex);
  return clamp01(1 - diff * 0.3);
};

const scoreSalary = (job: MatchableJob, talent: MatchableTalent) => {
  const NEUTRAL = 0.6;
  const CLOSE_GAP_RATIO = 1.2;

  if (
    job.salaryMax == null ||
    talent.desiredSalaryMin == null ||
    (job.currency && talent.currency && job.currency !== talent.currency)
  ) {
    return NEUTRAL;
  }
  if (job.salaryMax >= talent.desiredSalaryMin) return 1;
  if (job.salaryMax * CLOSE_GAP_RATIO >= talent.desiredSalaryMin) return 0.5;
  return 0.2;
};

const scoreLocation = (job: MatchableJob, talent: MatchableTalent) => {
  if (job.isRemote) {
    const overlapMatch = talent.timezoneOverlap.some((tag) => {
      if (tag === "ASYNC_ONLY") {
        return job.timezone?.toLowerCase().includes("async") ?? false;
      }
      const country = TIMEZONE_OVERLAP_COUNTRY[tag];
      return !!country && job.country === country;
    });
    if (overlapMatch || (job.country && job.country === talent.country)) {
      return 1;
    }
    return 0.6;
  }
  return job.country && job.country === talent.country ? 1 : 0.2;
};

const scoreEmploymentType = (job: MatchableJob, talent: MatchableTalent) => {
  // Kept below REASON_THRESHOLD like the other neutral fallbacks — "no
  // preference stated" shouldn't surface as "matches your preferred type".
  const NEUTRAL = 0.6;
  if (talent.employmentTypes.length === 0) return NEUTRAL;
  if (!talent.employmentTypes.includes(job.jobType)) {
    // FREELANCE has no corresponding preference option in the profile form —
    // an empty overlap there isn't a real mismatch signal.
    return job.jobType === "FREELANCE" ? NEUTRAL : 0.2;
  }
  return 1;
};

export const computeMatchScore = (
  job: MatchableJob,
  talent: MatchableTalent
): MatchResult => {
  const skills = scoreSkills(job, talent);
  const seniority = scoreSeniority(job, talent);
  const salary = scoreSalary(job, talent);
  const location = scoreLocation(job, talent);
  const employmentType = scoreEmploymentType(job, talent);

  const score = Math.round(
    WEIGHTS.skills * skills.fraction +
      WEIGHTS.seniority * seniority +
      WEIGHTS.salary * salary +
      WEIGHTS.location * location +
      WEIGHTS.employmentType * employmentType
  );

  const reasonCandidates: { weight: number; fraction: number; text: string }[] =
    [
      {
        weight: WEIGHTS.skills,
        fraction: skills.fraction,
        text:
          skills.total > 0
            ? `${skills.matched}/${skills.total} skills matched`
            : "Skill requirements open",
      },
      {
        weight: WEIGHTS.seniority,
        fraction: seniority,
        text:
          seniority >= 1 ? "Strong experience match" : "Close experience match",
      },
      {
        weight: WEIGHTS.salary,
        fraction: salary,
        text: "Salary within your range",
      },
      {
        weight: WEIGHTS.location,
        fraction: location,
        text: "Timezone overlap",
      },
      {
        weight: WEIGHTS.employmentType,
        fraction: employmentType,
        text: "Matches your preferred employment type",
      },
    ];

  const MAX_REASONS = 3;
  const reasons = reasonCandidates
    .filter((r) => r.fraction >= REASON_THRESHOLD)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_REASONS)
    .map((r) => r.text);

  return { score, reasons };
};
