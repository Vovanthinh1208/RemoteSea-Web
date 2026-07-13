import type { Job } from "@/types/job";
import type { PaginationMeta } from "@/core/pagination/pagination";

export type SavedJobDto = { userId: string; jobId: string; createdAt: string; job: Job };

export type SavedJobListResponseDto = {
  savedJobs: SavedJobDto[];
  pagination: PaginationMeta;
};

export type SavedJobIdsResponseDto = { jobIds: string[] };
