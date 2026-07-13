// Compat shim — the implementation now lives in applications.service.ts.
export {
  applyToJob,
  listMyApplications,
  getMyApplicationStats,
} from "@/features/applications/applications.service";
export type {
  ApplyPayload,
  ApplicationListResponse,
  ApplicationStatusCounts,
} from "@/features/applications/applications.service";
