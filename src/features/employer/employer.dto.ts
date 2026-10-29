import type {
  CreateEmployerProfilePayload,
  EmployerApplicant,
  EmployerJobApplicationsResponse,
  EmployerJobsResponse,
  EmployerProfile,
  EmployerProfileSummary,
  HiringFunnelResponse,
  PublicCompanyProfile,
  UpdateEmployerProfilePayload,
} from "@/types/employer";
import type { ApplicationStatus } from "@/types/application";

export type CreateEmployerProfileRequestDto = CreateEmployerProfilePayload;
export type CreateEmployerProfileResponseDto = {
  id: string;
  slug: string;
  companyName: string;
};
export type EmployerProfileSummaryDto = EmployerProfileSummary;
export type UpdateEmployerProfileRequestDto = UpdateEmployerProfilePayload;
export type EmployerProfileDto = EmployerProfile;
export type EmployerJobsResponseDto = EmployerJobsResponse;
export type EmployerJobApplicationsResponseDto =
  EmployerJobApplicationsResponse;

// Raw wire shape of GET /employer/applications/recent — `job` comes back
// nested (matching the backend's RecentApplicationListItemDto), flattened
// to jobId/jobTitle by toEmployerRecentApplicationsResponse in the mapper
// so the rest of the app can treat it exactly like EmployerApplicant.
export type EmployerRecentApplicationsResponseDto = {
  applications: (EmployerApplicant & {
    jobId: string;
    job: { title: string };
  })[];
};

export type HiringFunnelResponseDto = HiringFunnelResponse;

// GET /employer/dashboard — combines the four DTOs above into one response;
// each field is independently nullable, same as its standalone endpoint
// (see EmployerDashboardResponseDto on the backend).
export type EmployerDashboardResponseDto = {
  profile: EmployerProfileSummaryDto | null;
  jobs: EmployerJobsResponseDto | null;
  recentApplications: EmployerRecentApplicationsResponseDto | null;
  funnel: HiringFunnelResponseDto | null;
};

export type SubmitVerificationRequestDto = { email: string };
export type SubmitVerificationResponseDto = { message: string };
export type ConfirmVerificationRequestDto = { token: string };
export type ConfirmVerificationResponseDto = { message: string };

export type PublicCompanyProfileDto = PublicCompanyProfile;

export type BulkUpdateApplicationsRequestDto = {
  ids: string[];
  status: ApplicationStatus;
};
// PB56 AC2: what the talent sees in the offer block.
export type OfferDetailsDto = {
  salary: string;
  benefits: string;
  // YYYY-MM-DD
  startDate: string;
};

// Sent alongside a status change: private notes, PB58 BR2 rejection
// feedback for the talent, or PB56 offer details.
export type ApplicationDecisionDto = {
  notes?: string;
  reason?: string;
  offer?: OfferDetailsDto;
};

export type BulkUpdateApplicationsResponseDto = {
  updated: string[];
  // PB59 BR1: already-terminal applications that were left untouched.
  skipped: string[];
  failed: {
    id: string;
    reason: "NOT_FOUND" | "INVALID_TRANSITION" | "STALE";
  }[];
};
