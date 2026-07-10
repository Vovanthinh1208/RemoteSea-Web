import type { Job } from "@/types/job";

export type SavedJobDto = { userId: string; jobId: string; createdAt: string; job: Job };
