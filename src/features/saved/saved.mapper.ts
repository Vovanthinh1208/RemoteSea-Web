import type { SavedJobDto, SavedJobListResponseDto } from "@/features/saved/saved.dto";
import type { PaginationMeta } from "@/core/pagination/pagination";

export type SavedJob = SavedJobDto;

export type SavedJobListResponse = {
  savedJobs: SavedJob[];
  pagination: PaginationMeta;
};

export const toSavedJob = (dto: SavedJobDto): SavedJob => dto;

export const toSavedJobListResponse = (dto: SavedJobListResponseDto): SavedJobListResponse => ({
  savedJobs: dto.savedJobs.map(toSavedJob),
  pagination: dto.pagination,
});
