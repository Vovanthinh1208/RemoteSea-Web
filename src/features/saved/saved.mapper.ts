import type { SavedJobDto } from "@/features/saved/saved.dto";

export type SavedJob = SavedJobDto;

export const toSavedJob = (dto: SavedJobDto): SavedJob => dto;
