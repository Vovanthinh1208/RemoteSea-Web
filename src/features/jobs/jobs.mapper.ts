import type { JobDto, JobListItemDto, JobListResponseDto } from "@/features/jobs/jobs.dto";
import type { PaginationMeta } from "@/core/pagination/pagination";
import type { Job, JobFacets, JobListItem } from "@/types/job";

// Domain-shaped aggregate consumed by the Jobs board — owned here since this is
// where DTO -> domain mapping happens.
export type JobListResponse = {
  jobs: JobListItem[];
  pagination: PaginationMeta;
  facets: JobFacets;
};

// Identity today (JobDto/JobListItemDto == Job/JobListItem) — this is an intentional
// seam, not wasted code: if the wire shape ever diverges from what the UI needs
// (renamed field, date-string -> Date, etc.), only this file changes.
export const toJob = (dto: JobDto): Job => dto;
export const toJobListItem = (dto: JobListItemDto): JobListItem => dto;

export const toJobListResponse = (dto: JobListResponseDto): JobListResponse => ({
  jobs: dto.jobs.map(toJobListItem),
  pagination: dto.pagination,
  facets: dto.facets,
});
