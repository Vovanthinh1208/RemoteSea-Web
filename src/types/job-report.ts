import { translate } from "@/i18n/runtime";

export type JobReportReason =
  | "SCAM"
  | "ILLEGAL_FEE"
  | "MISLEADING"
  | "ALREADY_FILLED"
  | "DISCRIMINATORY"
  | "DUPLICATE"
  | "OTHER";

export type JobReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

// Reasons offered by the report form — exactly the PB88 AC2 list (scam/MLM,
// illegal fee collection, discriminatory content, false information, other).
// ALREADY_FILLED and DUPLICATE remain valid JobReportReason values so reports
// filed before PB88 still render with a label in the admin queue.
export const JOB_REPORT_REASONS: JobReportReason[] = [
  "SCAM",
  "ILLEGAL_FEE",
  "DISCRIMINATORY",
  "MISLEADING",
  "OTHER",
];

// Display labels live in the "jobs" locale namespace (jobs.report.reason.<CODE>);
// resolve with jobReportReasonLabel() so they follow the active language.
export const jobReportReasonLabel = (reason: JobReportReason): string =>
  translate(`jobs.report.reason.${reason}`);
