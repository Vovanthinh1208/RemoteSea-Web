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
  EXPIRED: "closed",
};

export const STATUS_LABEL: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "In review",
  ACTIVE: "Live",
  // "Filled" presumed a specific reason — a job can also close because it
  // expired or the employer pulled it, not just because it was filled.
  CLOSED: "Closed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const APPLICANT_STATUS: Record<ApplicationStatus, ApplicantStatusGroup> =
  {
    PENDING: "new",
    REVIEWING: "reviewing",
    SHORTLISTED: "shortlisted",
    INTERVIEW: "shortlisted",
    OFFERED: "shortlisted",
    OFFER_ACCEPTED: "archived",
    OFFER_DECLINED: "archived",
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

// ApplicantsPanel's empty state — distinguishes "this employer has no
// applicants at all" from "this filter matched none" (e.g. the Shortlisted
// tab with zero shortlisted candidates, while other tabs are non-empty).
// The generic message read as "you have no applicants" in the filtered
// case, which isn't true and could read as a bug to an employer who knows
// they've received applications.
export const applicantsEmptyMessage = (
  activeFilterLabel: string | null
): string =>
  activeFilterLabel
    ? `No ${activeFilterLabel.toLowerCase()} applicants.`
    : "No applicants yet.";

// ApplicantsPanel used to hard-cap display at 8 rows with no way to see the
// rest, even though the underlying data (up to RECENT_APPLICATIONS_LIST_CAP
// applicants, already fetched by useEmployerDashboard) was already in
// memory — "Show all" reveals more of it, no extra request. Capped at 50
// (not `list.length`) to match BULK_UPDATE_MAX_ITEMS on the backend — the
// "select all eligible" checkbox must never be able to select more than a
// single bulk-update call can carry.
export const INITIAL_VISIBLE_APPLICANTS = 8;
export const MAX_VISIBLE_APPLICANTS = 50;
