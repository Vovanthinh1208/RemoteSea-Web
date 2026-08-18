export type JobReportReason =
  | "SCAM"
  | "MISLEADING"
  | "ALREADY_FILLED"
  | "DISCRIMINATORY"
  | "DUPLICATE"
  | "OTHER";

export type JobReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export const JOB_REPORT_REASON_LABELS: Record<JobReportReason, string> = {
  SCAM: "This looks like a scam",
  MISLEADING: "Misleading description",
  ALREADY_FILLED: "Position already filled",
  DISCRIMINATORY: "Discriminatory requirements",
  DUPLICATE: "Duplicate listing",
  OTHER: "Other",
};
