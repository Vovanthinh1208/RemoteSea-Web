// Compat shim — the implementation now lives in employer.service.ts.
export {
  createEmployerProfile,
  getEmployerProfile,
  updateEmployerProfile,
  listEmployerJobs,
  listJobApplications,
  updateApplicationStatus,
} from "@/features/employer/employer.service";
