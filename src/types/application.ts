import type { JobListItem } from "@/types/job";

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  // The talent's own response to an extended offer — set via
  // useRespondToOffer, never something an employer PATCH can set directly.
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
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
  // PB53 AC2: the contact phone entered on the apply form.
  contactPhone: string | null;
  // PB58 BR2: feedback the employer chose to share when rejecting.
  rejectionReason: string | null;
  // PB56 AC1–2: the offer as sent by the employer, and the talent's own
  // mandatory reason when declining it.
  offerSalary: string | null;
  offerBenefits: string | null;
  offerStartDate: string | null;
  offerDeclineReason: string | null;
  statusEvents: ApplicationStatusEvent[];
};

// PB56: accepting takes no reason, declining requires one.
export type OfferResponseBody =
  { response: "ACCEPTED" } | { response: "DECLINED"; reason: string };

// GET /applications embeds the same narrow "job card" shape as the /jobs list —
// the dashboard rows only read title/country/employer.companyName from it.
export type ApplicationWithJob = Application & { job: JobListItem };
