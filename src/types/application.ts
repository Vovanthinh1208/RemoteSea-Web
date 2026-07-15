import type { JobListItem } from "@/types/job";

export type ApplicationStatus =
  "PENDING" | "REVIEWING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "REJECTED" | "WITHDRAWN";

export type Application = {
  id: string;
  jobId: string;
  talentId: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string;
  updatedAt: string;
};

// GET /applications embeds the same narrow "job card" shape as the /jobs list —
// the dashboard rows only read title/country/employer.companyName from it.
export type ApplicationWithJob = Application & { job: JobListItem };
