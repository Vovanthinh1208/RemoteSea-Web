import { pickColorFromString } from "@/utils/color";
import { timeAgoLong } from "@/utils/time";
import type { ApplicationStatus } from "@/types/application";
import type { JobStatus } from "@/types/job";

export type ListingStatusGroup = "review" | "live" | "closed";
export type ApplicantStatusGroup =
  "new" | "reviewing" | "shortlisted" | "archived";

export const STATUS_GROUP: Record<JobStatus, ListingStatusGroup> = {
  DRAFT: "review",
  PENDING_REVIEW: "review",
  ACTIVE: "live",
  CLOSED: "closed",
  REJECTED: "closed",
};

export const STATUS_LABEL: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "In review",
  ACTIVE: "Live",
  // "Filled" presumed a specific reason — a job can also close because it
  // expired or the employer pulled it, not just because it was filled.
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

export const APPLICANT_STATUS: Record<ApplicationStatus, ApplicantStatusGroup> =
  {
    PENDING: "new",
    REVIEWING: "reviewing",
    SHORTLISTED: "shortlisted",
    INTERVIEW: "shortlisted",
    OFFERED: "shortlisted",
    REJECTED: "archived",
    WITHDRAWN: "archived",
  };

export const NEXT_STAGE: Partial<Record<ApplicationStatus, ApplicationStatus>> =
  {
    PENDING: "REVIEWING",
    REVIEWING: "SHORTLISTED",
    SHORTLISTED: "INTERVIEW",
    INTERVIEW: "OFFERED",
  };

export const NEXT_LABEL: Partial<Record<ApplicationStatus, string>> = {
  PENDING: "Review",
  REVIEWING: "Shortlist",
  SHORTLISTED: "Interview",
  INTERVIEW: "Offer",
};

// Employer Response SLA — mirrors the API's BACKLOG_THRESHOLD_MS
// (applications/constants.ts) exactly, so this row indicator shows the same
// signal driving the backend's reminder-email cron. PENDING is measured from
// appliedAt (never touched at all); REVIEWING from updatedAt (time since it
// entered that stage — only real transitions bump it, see
// EmployerRepository.updateApplication).
const DAY_MS = 24 * 60 * 60 * 1000;
export const BACKLOG_THRESHOLD_MS = {
  PENDING: 3 * DAY_MS,
  REVIEWING: 7 * DAY_MS,
} as const;

export const backlogDays = (
  status: ApplicationStatus,
  appliedAt: string,
  updatedAt: string,
  now: number = Date.now()
): number | null => {
  if (status === "PENDING") {
    const elapsed = now - new Date(appliedAt).getTime();
    return elapsed > BACKLOG_THRESHOLD_MS.PENDING
      ? Math.floor(elapsed / DAY_MS)
      : null;
  }
  if (status === "REVIEWING") {
    const elapsed = now - new Date(updatedAt).getTime();
    return elapsed > BACKLOG_THRESHOLD_MS.REVIEWING
      ? Math.floor(elapsed / DAY_MS)
      : null;
  }
  return null;
};

const COLORS = [
  "#1F8A3A",
  "#2684FF",
  "#E97560",
  "#7C3AED",
  "#0EA5E9",
  "#B45309",
];

export const colorFor = (s: string): string => pickColorFromString(s, COLORS);

export const timeAgo = timeAgoLong;
