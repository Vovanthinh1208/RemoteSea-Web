// Compat shim — the implementation now lives in saved.service.ts.
export { listSavedJobs, listSavedJobIds, saveJob, unsaveJob } from "@/features/saved/saved.service";
export type { SavedJob, SavedJobListResponse } from "@/features/saved/saved.service";
