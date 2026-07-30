import { z, type ZodType } from "zod";
import type { PaginationMeta } from "@/core/pagination/pagination";
import type {
  Job,
  JobFacets,
  JobListItem,
  JobType,
  ExperienceLevel,
  PlanType,
} from "@/types/job";

// Wire-shape types for GET /jobs, GET /jobs/:id, POST /jobs. Currently identical to
// the domain types in types/job.ts — kept as distinct aliases (not merged) so a future
// backend shape change only touches this file + jobs.mapper.ts, not every component
// that consumes Job/JobListItem.
export type JobDto = Job;
export type JobListItemDto = JobListItem;
export type JobFacetsDto = JobFacets;

export type JobListResponseDto = {
  jobs: JobListItemDto[];
  pagination: PaginationMeta;
  facets: JobFacetsDto;
};

// Already-translated query params sent to GET /jobs (UI filter vocabulary -> wire enums
// happens in jobs.service.ts's buildJobListParams, not here).
export type JobListQueryParams = {
  q?: string;
  type?: JobType[];
  level?: ExperienceLevel[];
  category?: string[];
  timezone?: string[];
  salaryMin?: number;
  salaryMax?: number;
  sort?: string;
  page: number;
  limit: number;
};

export type CreateJobRequestDto = {
  title: string;
  description: string;
  requirements?: string;
  jobType: JobType;
  level: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  timezone?: string;
  country?: string;
  benefits?: string[];
  planType: PlanType;
  categoryIds: string[];
  skillIds?: string[];
};

export type CreateJobResponseDto = {
  id: string;
  slug: string;
  status: string;
};

// Response validation — scoped to jobs as the pilot feature (see refactor plan §Validation).
// zod's default "strip" mode silently drops unrecognized keys instead of failing on them,
// so additive backend fields never break validation. z.enum (not z.string) on the literal
// union fields is what lets the `: ZodType<...>` annotations below typecheck exactly
// against jobs.dto's plain TS types — a real compile-time guard against the two drifting.
const jobTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
]);
const experienceLevelSchema = z.enum([
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
]);
const jobStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "ACTIVE",
  "CLOSED",
  "REJECTED",
]);
const planTypeSchema = z.enum(["STANDARD", "FEATURED", "HANDS_ON"]);

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
});
const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const jobListItemEmployerSchema = z.object({
  companyName: z.string(),
  isVerified: z.boolean(),
});

const jobEmployerSummarySchema = z.object({
  companyName: z.string(),
  logoUrl: z.string().nullable(),
  slug: z.string(),
  isVerified: z.boolean(),
  size: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  hqCountry: z.string().nullable().optional(),
});

// Internal — only consumed by jobListResponseSchema below (was exported with
// no outside importers).
const jobListItemSchema: ZodType<JobListItemDto> = z.object({
  id: z.string(),
  title: z.string(),
  jobType: jobTypeSchema,
  level: experienceLevelSchema,
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  isRemote: z.boolean(),
  timezone: z.string().nullable(),
  country: z.string().nullable(),
  isFeatured: z.boolean(),
  vnHireCount: z.number(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  employer: jobListItemEmployerSchema,
  categories: z.array(z.object({ category: categorySchema })),
  skills: z.array(z.object({ skill: skillSchema })),
});

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number(),
});

const jobFacetsSchema = z.object({
  jobType: z.record(z.string(), z.number()),
  timezone: z.record(z.string(), z.number()),
  seniority: z.record(z.string(), z.number()),
  category: z.record(z.string(), z.number()),
});

export const jobListResponseSchema: ZodType<JobListResponseDto> =
  z.object({
    jobs: z.array(jobListItemSchema),
    pagination: paginationSchema,
    facets: jobFacetsSchema,
  });

export const jobSchema: ZodType<JobDto> = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  requirements: z.string().nullable(),
  jobType: jobTypeSchema,
  level: experienceLevelSchema,
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  currency: z.string(),
  isRemote: z.boolean(),
  timezone: z.string().nullable(),
  country: z.string().nullable(),
  status: jobStatusSchema,
  planType: planTypeSchema,
  benefits: z.array(z.string()),
  vnHireCount: z.number(),
  isFeatured: z.boolean(),
  viewCount: z.number(),
  applyCount: z.number(),
  publishedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  employer: jobEmployerSummarySchema,
  categories: z.array(z.object({ category: categorySchema })),
  skills: z.array(z.object({ skill: skillSchema })),
});
