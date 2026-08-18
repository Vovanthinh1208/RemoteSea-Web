import type { JobReportReason, JobReportStatus } from "@/types/job-report";

export type CreateJobReportRequestDto = {
  reason: JobReportReason;
  details?: string;
};

export type CreateJobReportResponseDto = {
  id: string;
  status: JobReportStatus;
};
