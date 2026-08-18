import { useMutation } from "@tanstack/react-query";
import { reportJob } from "@/features/jobs/job-reports.service";
import type { JobReportReason } from "@/types/job-report";

// Fire-and-forget from the talent's perspective — no list query on this side
// (a talent never sees "my reports"), so no cache to invalidate.
export const useReportJob = () =>
  useMutation({
    mutationFn: ({
      jobId,
      reason,
      details,
    }: {
      jobId: string;
      reason: JobReportReason;
      details?: string;
    }) => reportJob(jobId, reason, details),
  });
