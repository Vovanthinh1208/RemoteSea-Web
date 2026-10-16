import { z } from "zod";
import { m } from "@/i18n/zod";
import {
  NOTICE_PERIOD_OPTIONS,
  PRIMARY_ROLE_OPTIONS,
  RIGHT_TO_WORK_OPTIONS,
  SENIORITY_OPTIONS,
  YEARS_BUCKETS,
} from "@/features/talent/talent.constants";

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, m("validation.nameRequired"))
    .min(2, m("validation.nameMin"))
    .max(100, m("validation.nameTooLong"))
    .refine((v) => !/[<>]/.test(v), m("validation.nameInvalid")),
  headline: z.string().max(80, m("validation.max80")).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().max(320, m("validation.max320")).optional(),
  seniority: z.enum(SENIORITY_OPTIONS),
  yearsBucket: z.enum(YEARS_BUCKETS),
  primaryRole: z.enum(PRIMARY_ROLE_OPTIONS),
  rightToWork: z.enum(RIGHT_TO_WORK_OPTIONS),
  noticePeriod: z.enum(NOTICE_PERIOD_OPTIONS),
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

export const submitVerificationSchema = z.object({
  email: z
    .string()
    .min(1, m("validation.emailRequired"))
    .email(m("validation.emailInvalid")),
});
export type SubmitVerificationFormValues = z.infer<
  typeof submitVerificationSchema
>;
