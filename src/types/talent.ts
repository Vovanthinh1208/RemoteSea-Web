import type { ExperienceLevel, Skill } from "@/types/job";

export type TalentVisibility = "PUBLIC" | "VERIFIED_EMPLOYERS";

export type TalentSkill = {
  talentId: string;
  skillId: string;
  yearsExp: number | null;
  skill: Skill;
};

export type TalentProfile = {
  id: string;
  userId: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  country: string | null;
  timezone: string | null;
  yearsExperience: number | null;
  level: ExperienceLevel;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  isOpenToWork: boolean;
  visibility: TalentVisibility;
  primaryRole?: PrimaryRole | null;
  rightToWork?: RightToWork | null;
  employmentTypes: EmploymentType[];
  timezoneOverlap: TimezoneOverlap[];
  // Omitted entirely (not null) by GET /talent/:slug when isOpenToWork is false.
  desiredSalaryMin?: number | null;
  desiredSalaryMax?: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  skills: TalentSkill[];
  user?: { name: string | null; image?: string | null };
};

export type PrimaryRole =
  | "Software Engineer · Frontend"
  | "Software Engineer · Backend"
  | "Software Engineer · Full-stack"
  | "Product Designer"
  | "Product Manager"
  | "Data Analyst";

export type RightToWork =
  | "Vietnam only"
  | "Vietnam + Singapore"
  | "Vietnam + Australia"
  | "Open to relocation / sponsorship";

export type EmploymentType = "FULL_TIME" | "CONTRACT" | "PART_TIME";

export type TimezoneOverlap = "SG_HOURS" | "AU_HOURS" | "ASYNC_ONLY";

export type UpdateTalentProfilePayload = Partial<{
  headline: string;
  bio: string;
  location: string;
  country: string;
  timezone: string;
  yearsExperience: number;
  level: ExperienceLevel;
  resumeUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  isOpenToWork: boolean;
  visibility: TalentVisibility;
  primaryRole: PrimaryRole;
  rightToWork: RightToWork;
  employmentTypes: EmploymentType[];
  timezoneOverlap: TimezoneOverlap[];
  desiredSalaryMin: number;
  desiredSalaryMax: number;
  skills: { skillId: string; yearsExp?: number }[];
}>;
