import type { RequestOptions } from "@/core/http/request-config";
import { parseOrThrow } from "@/core/validation/validate-response";
import { jobsRepository } from "@/features/jobs/jobs.repository";
import {
  toJob,
  toJobListResponse,
  type JobListResponse,
} from "@/features/jobs/jobs.mapper";
import {
  jobListResponseSchema,
  jobSchema,
  type CreateJobRequestDto,
  type CreateJobResponseDto,
  type JobListQueryParams,
} from "@/features/jobs/jobs.dto";
import {
  JOBTYPE_TO_ENUMS,
  SENIORITY_TO_LEVELS,
  SALARY_FLOOR,
  SALARY_CEIL,
  type JobFilters,
} from "@/features/jobs/job-filters";
import type { Job } from "@/types/job";

export type { JobListResponse };
export type CreateJobPayload = CreateJobRequestDto;

export const buildJobListParams = (
  query: JobFilters,
  limit: number
): JobListQueryParams => {
  const { filters } = query;
  const type = filters.jobType.flatMap(
    (label) => JOBTYPE_TO_ENUMS[label] ?? []
  );
  const level = filters.seniority.flatMap(
    (label) => SENIORITY_TO_LEVELS[label] ?? []
  );
  const hasSalaryRange =
    filters.salaryMin > SALARY_FLOOR || filters.salaryMax < SALARY_CEIL;

  return {
    q: query.q || undefined,
    type: type.length ? type : undefined,
    level: level.length ? level : undefined,
    category: filters.category.length ? filters.category : undefined,
    timezone: filters.timezone.length ? filters.timezone : undefined,
    salaryMin: hasSalaryRange ? filters.salaryMin : undefined,
    salaryMax: hasSalaryRange ? filters.salaryMax : undefined,
    // Always sent explicitly now — "recent" used to be omittable because it
    // matched the API's unset-sort default (featured-first), but the API now
    // treats "recent" as a distinct order (publishedAt desc only), so
    // omitting it would silently request featured-first while the UI shows
    // "Most recent" selected.
    sort: query.sort,
    page: query.page,
    limit,
  };
};

export const listJobs = async (
  query: JobFilters,
  limit: number,
  opts?: RequestOptions
): Promise<JobListResponse> => {
  const dto = await jobsRepository.list(buildJobListParams(query, limit), opts);
  return toJobListResponse(
    parseOrThrow(jobListResponseSchema, dto, "GET /jobs")
  );
};

export const getJob = async (
  id: string,
  opts?: RequestOptions
): Promise<Job> => {
  const dto = await jobsRepository.getById(id, opts);
  return toJob(parseOrThrow(jobSchema, dto, "GET /jobs/:id"));
};

export const createJob = async (
  payload: CreateJobRequestDto
): Promise<CreateJobResponseDto> => jobsRepository.create(payload);
