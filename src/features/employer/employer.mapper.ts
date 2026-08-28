import type {
  EmployerJobApplicationsResponseDto,
  EmployerJobsResponseDto,
  EmployerProfileDto,
  EmployerProfileSummaryDto,
  EmployerRecentApplicationsResponseDto,
  PublicCompanyProfileDto,
} from "@/features/employer/employer.dto";
import type {
  EmployerJobApplicationsResponse,
  EmployerJobsResponse,
  EmployerProfile,
  EmployerProfileSummary,
  EmployerRecentApplicationsResponse,
  PublicCompanyProfile,
} from "@/types/employer";

export const toEmployerProfileSummary = (
  dto: EmployerProfileSummaryDto
): EmployerProfileSummary => dto;
export const toEmployerProfile = (dto: EmployerProfileDto): EmployerProfile =>
  dto;
export const toEmployerJobsResponse = (
  dto: EmployerJobsResponseDto
): EmployerJobsResponse => dto;
export const toEmployerJobApplicationsResponse = (
  dto: EmployerJobApplicationsResponseDto
): EmployerJobApplicationsResponse => dto;
// The one real transform in this file (every other mapper here is an
// identity passthrough) — flattens the wire shape's nested `job: {title}`
// into jobTitle so the rest of the app can treat a recent-applications row
// exactly like EmployerApplicant + jobId/jobTitle, matching what
// useEmployerApplicationsAggregate used to build by hand from N separate
// per-job responses.
export const toEmployerRecentApplicationsResponse = (
  dto: EmployerRecentApplicationsResponseDto
): EmployerRecentApplicationsResponse => ({
  applications: dto.applications.map(({ job, ...rest }) => ({
    ...rest,
    jobTitle: job.title,
  })),
});
export const toPublicCompanyProfile = (
  dto: PublicCompanyProfileDto
): PublicCompanyProfile => dto;
