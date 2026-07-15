import type { JobListItem } from "@/types/job";
import type { PaginationMeta } from "@/core/pagination/pagination";

// The embedded job is the same narrow "job card" shape GET /jobs returns per
// list item — SavedJobsPage renders it through JobCard, nothing more.
export type SavedJobDto = {
  userId: string;
  jobId: string;
  createdAt: string;
  job: JobListItem;
};

export type SavedJobListResponseDto = {
  savedJobs: SavedJobDto[];
  pagination: PaginationMeta;
};

export type SavedJobIdsResponseDto = { jobIds: string[] };
