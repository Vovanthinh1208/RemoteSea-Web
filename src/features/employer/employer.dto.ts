import type {
  CreateEmployerProfilePayload,
  EmployerJobApplicationsResponse,
  EmployerJobsResponse,
  EmployerProfile,
  EmployerProfileSummary,
  PublicCompanyProfile,
  UpdateEmployerProfilePayload,
} from "@/types/employer";

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
