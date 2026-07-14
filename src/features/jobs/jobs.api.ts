// Compat shim — the implementation now lives in jobs.service.ts (which composes
// jobs.repository.ts + jobs.mapper.ts). Kept so any existing import of
// "@/features/jobs/jobs.api" keeps working unchanged.
export { listJobs, getJob, createJob } from "@/features/jobs/jobs.service";
export type { JobListResponse, CreateJobPayload } from "@/features/jobs/jobs.service";
