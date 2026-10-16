import { translate } from "@/i18n/runtime";

export type JobReportReason =
  | "SCAM"
  | "MISLEADING"
  | "ALREADY_FILLED"
  | "DISCRIMINATORY"
  | "DUPLICATE"
  | "OTHER";

export type JobReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export const JOB_REPORT_REASONS: JobReportReason[] = [
  "SCAM",
  "MISLEADING",
  "ALREADY_FILLED",
  "DISCRIMINATORY",
  "DUPLICATE",
  "OTHER",
];

// Display labels live in the "jobs" locale namespace (jobs.report.reason.<CODE>);
// resolve with jobReportReasonLabel() so they follow the active language.
export const jobReportReasonLabel = (reason: JobReportReason): string =>
  translate(`jobs.report.reason.${reason}`);
