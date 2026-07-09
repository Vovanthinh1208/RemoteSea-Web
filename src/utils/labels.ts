import type { ExperienceLevel, JobType } from "@/types/job";

// Canonical copy — was previously duplicated verbatim in admin.utils.ts and jobs.utils.ts.
export const LEVEL_LABELS: Record<ExperienceLevel, string> = {
  ENTRY: "Entry",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  EXECUTIVE: "Executive",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};
