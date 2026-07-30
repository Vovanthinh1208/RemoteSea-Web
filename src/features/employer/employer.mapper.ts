import type {
  EmployerJobApplicationsResponseDto,
  EmployerJobsResponseDto,
  EmployerProfileDto,
  EmployerProfileSummaryDto,
} from "@/features/employer/employer.dto";
import type {
  EmployerJobApplicationsResponse,
  EmployerJobsResponse,
  EmployerProfile,
  EmployerProfileSummary,
} from "@/types/employer";

export const toEmployerProfileSummary = (
  dto: EmployerProfileSummaryDto
): EmployerProfileSummary => dto;
export const toEmployerProfile = (
  dto: EmployerProfileDto
): EmployerProfile => dto;
export const toEmployerJobsResponse = (
  dto: EmployerJobsResponseDto
): EmployerJobsResponse => dto;
export const toEmployerJobApplicationsResponse = (
  dto: EmployerJobApplicationsResponseDto
): EmployerJobApplicationsResponse => dto;
