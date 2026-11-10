import { z } from "zod";
import { m } from "@/i18n/zod";

export const JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
] as const;
export const LEVELS = ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"] as const;
export const FREQUENCIES = ["IMMEDIATE", "DAILY", "WEEKLY"] as const;

export const createAlertFormSchema = z.object({
  name: z.string().trim().min(1, m("validation.nameRequired")).max(100),
  keywords: z.string().max(200).optional(),
  jobType: z.enum(JOB_TYPES).optional().or(z.literal("")),
  level: z.enum(LEVELS).optional().or(z.literal("")),
  salaryMin: z
    .string()
    .refine(
      (v) =>
        !v ||
        (Number.isInteger(Number(v)) &&
          Number(v) > 0 &&
          Number(v) <= 10_000_000),
      m("validation.salaryNumber")
    )
    .optional(),
  country: z.string().max(100).optional(),
  frequency: z.enum(FREQUENCIES),
  categoryIds: z.array(z.string()).max(3),
});
export type CreateAlertFormValues = z.infer<typeof createAlertFormSchema>;
