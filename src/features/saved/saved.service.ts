import type { RequestOptions } from "@/core/http/request-config";
import { savedRepository } from "@/features/saved/saved.repository";
import { toSavedJob, type SavedJob } from "@/features/saved/saved.mapper";

export type { SavedJob };

export const listSavedJobs = async (opts?: RequestOptions): Promise<SavedJob[]> =>
  (await savedRepository.list(opts)).map(toSavedJob);

export const saveJob = async (jobId: string): Promise<{ saved: boolean }> =>
  savedRepository.save(jobId);

export const unsaveJob = async (jobId: string): Promise<{ saved: boolean }> =>
  savedRepository.unsave(jobId);
