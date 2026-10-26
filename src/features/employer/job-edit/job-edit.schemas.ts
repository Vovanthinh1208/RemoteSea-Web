import { z } from "zod";
import { m, v } from "@/i18n/zod";
import type { ExperienceLevel, Job, JobType } from "@/types/job";
import type { UpdateJobRequestDto } from "@/features/jobs/jobs.dto";
import { MIN_JOB_DESCRIPTION_LENGTH } from "@/features/post-job/post-job.schemas";

// PB42 AC2: the fields an employer may change on a DRAFT/REJECTED listing.
// Status, category and skills are deliberately absent (AC2 / RC2).
export type JobEditFormState = {
  title: string;
  description: string;
  requirements: string;
  jobType: JobType;
  level: ExperienceLevel;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  timezone: string;
  country: string;
  benefits: string;
};

export const EDITABLE_JOB_STATUSES: ReadonlyArray<Job["status"]> = [
  "DRAFT",
  "REJECTED",
];

export const toJobEditForm = (job: Job): JobEditFormState => ({
  title: job.title,
  description: job.description,
  requirements: job.requirements ?? "",
  jobType: job.jobType,
  level: job.level,
  salaryMin: job.salaryMin?.toString() ?? "",
  salaryMax: job.salaryMax?.toString() ?? "",
  currency: job.currency,
  timezone: job.timezone ?? "",
  country: job.country ?? "",
  benefits: job.benefits.join("\n"),
});

const positiveInt = (requiredKey: string) =>
  z
    .string()
    .trim()
    .min(1, m(requiredKey))
    .regex(/^\d+$/, m("validation.salaryNumber"));

export const jobEditSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, m("validation.jobTitleLength"))
      .max(200, m("validation.jobTitleLength")),
    description: z
      .string()
      .trim()
      .min(
        MIN_JOB_DESCRIPTION_LENGTH,
        m("validation.jobDescMin", { min: MIN_JOB_DESCRIPTION_LENGTH })
      ),
    salaryMin: positiveInt("validation.salMinRequired"),
    salaryMax: positiveInt("validation.salMaxRequired"),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, m("validation.currencyFormat")),
  })
  // PB42 AC3: salaryMax >= salaryMin.
  .refine((f) => Number(f.salaryMax) >= Number(f.salaryMin), {
    error: v("validation.salMaxOrder"),
    path: ["salaryMax"],
  });

export const validateJobEdit = (form: JobEditFormState): string[] => {
  const result = jobEditSchema.safeParse(form);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

export const toUpdateJobPayload = (
  form: JobEditFormState
): UpdateJobRequestDto => ({
  title: form.title.trim(),
  description: form.description.trim(),
  requirements: form.requirements.trim() || undefined,
  jobType: form.jobType,
  level: form.level,
  salaryMin: Number(form.salaryMin),
  salaryMax: Number(form.salaryMax),
  currency: form.currency.trim(),
  timezone: form.timezone.trim() || undefined,
  country: form.country.trim() || undefined,
  benefits: form.benefits
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 10),
});
