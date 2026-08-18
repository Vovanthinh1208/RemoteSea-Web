import type {
  CreateEmployerProfilePayload,
  EmployerJobApplicationsResponse,
  EmployerJobsResponse,
  EmployerProfile,
  EmployerProfileSummary,
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

export type SubmitVerificationRequestDto = { email: string };
export type SubmitVerificationResponseDto = { message: string };
export type ConfirmVerificationRequestDto = { token: string };
export type ConfirmVerificationResponseDto = { message: string };

export type PublicCompanyProfileDto = PublicCompanyProfile;

export type BulkUpdateApplicationsRequestDto = {
  ids: string[];
  status: ApplicationStatus;
};
export type BulkUpdateApplicationsResponseDto = {
  updated: string[];
  failed: {
    id: string;
    reason: "NOT_FOUND" | "INVALID_TRANSITION" | "STALE";
  }[];
};
