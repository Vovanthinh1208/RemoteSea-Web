import { jobReportsRepository } from "@/features/jobs/job-reports.repository";
import type { JobReportReason, JobReportStatus } from "@/types/job-report";

export const reportJob = async (
  jobId: string,
  reason: JobReportReason,
  details?: string
): Promise<{ id: string; status: JobReportStatus }> =>
  jobReportsRepository.create(jobId, { reason, details });
