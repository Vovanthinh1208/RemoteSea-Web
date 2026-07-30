import { z } from "zod";
import {
  PRIMARY_ROLE_OPTIONS,
  RIGHT_TO_WORK_OPTIONS,
  SENIORITY_OPTIONS,
  YEARS_BUCKETS,
} from "@/features/talent/talent.constants";

export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  headline: z
    .string()
    .max(80, "Keep it under 80 characters")
    .optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().max(320, "Keep it under 320 characters").optional(),
  seniority: z.enum(SENIORITY_OPTIONS),
  yearsBucket: z.enum(YEARS_BUCKETS),
  primaryRole: z.enum(PRIMARY_ROLE_OPTIONS),
  rightToWork: z.enum(RIGHT_TO_WORK_OPTIONS),
  desiredSalaryMin: z.number().int().min(0),
  desiredSalaryMax: z.number().int().min(0),
  isOpenToWork: z.boolean(),
  visibility: z.enum(["PUBLIC", "VERIFIED_EMPLOYERS"]),
  resumeUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
