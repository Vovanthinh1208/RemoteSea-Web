import type { ExperienceLevel, Skill } from "@/types/job";
import type { EmploymentType, TimezoneOverlap } from "@/types/talent";

export type TalentSearchItem = {
  id: string;
  slug: string;
  headline: string | null;
  level: ExperienceLevel;
  country: string | null;
  timezone: string | null;
  yearsExperience: number | null;
  desiredSalaryMin: number | null;
  desiredSalaryMax: number | null;
  currency: string;
  employmentTypes: EmploymentType[];
  timezoneOverlap: TimezoneOverlap[];
  updatedAt: string;
  user: { name: string | null; image: string | null };
  skills: { skill: Skill }[];
};

export type TalentSearchResponse = {
  talents: TalentSearchItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
