import type { RequestOptions } from "@/core/http/request-config";
import { savedRepository } from "@/features/saved/saved.repository";
import {
  toSavedJobListResponse,
  type SavedJob,
  type SavedJobListResponse,
} from "@/features/saved/saved.mapper";

export type { SavedJob, SavedJobListResponse };

export const listSavedJobs = async (
  page: number,
  limit: number,
  opts?: RequestOptions
): Promise<SavedJobListResponse> =>
  toSavedJobListResponse(await savedRepository.list(page, limit, opts));

export const listSavedJobIds = async (
  opts?: RequestOptions
): Promise<string[]> => (await savedRepository.listIds(opts)).jobIds;

export const saveJob = async (jobId: string): Promise<{ saved: boolean }> =>
  savedRepository.save(jobId);

export const unsaveJob = async (jobId: string): Promise<{ saved: boolean }> =>
  savedRepository.unsave(jobId);
