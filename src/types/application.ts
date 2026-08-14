import type { JobListItem } from "@/types/job";

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

export type ApplicationStatusEvent = {
  status: ApplicationStatus;
  createdAt: string;
};

// No `notes` here — that field is the employer's private note on the candidate
// (PATCH /employer/applications/:id) and the API never sends it to the talent.
export type Application = {
  id: string;
  jobId: string;
  talentId: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  // Application Transparency — see ApplicationTimeline. viewedAt is the
  // employer's list-view stamp; statusEvents is the full history, oldest
  // first, always starting with the initial PENDING event.
  viewedAt: string | null;
  statusEvents: ApplicationStatusEvent[];
};

// GET /applications embeds the same narrow "job card" shape as the /jobs list —
// the dashboard rows only read title/country/employer.companyName from it.
export type ApplicationWithJob = Application & { job: JobListItem };
