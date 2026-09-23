import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { ApplicationStatus } from "@/types/application";
import type { JobStatus } from "@/types/job";
import type {
  BulkUpdateApplicationsResponseDto,
  ConfirmVerificationRequestDto,
  ConfirmVerificationResponseDto,
  CreateEmployerProfileRequestDto,
  CreateEmployerProfileResponseDto,
  EmployerDashboardResponseDto,
  EmployerJobApplicationsResponseDto,
  EmployerJobsResponseDto,
  EmployerProfileDto,
  EmployerProfileSummaryDto,
  EmployerRecentApplicationsResponseDto,
  HiringFunnelResponseDto,
  PublicCompanyProfileDto,
  SubmitVerificationRequestDto,
  SubmitVerificationResponseDto,
  UpdateEmployerProfileRequestDto,
} from "@/features/employer/employer.dto";

export const employerRepository = {
  createProfile: async (
    payload: CreateEmployerProfileRequestDto
  ): Promise<CreateEmployerProfileResponseDto> => {
    const { data } = await apiClient.post<CreateEmployerProfileResponseDto>(
      "/employer/profile",
      payload
    );
    return data;
  },

  getProfile: async (
    opts?: RequestOptions
  ): Promise<EmployerProfileSummaryDto> => {
    const { data } = await apiClient.get<EmployerProfileSummaryDto>(
      "/employer/profile",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },

  // The backend's update endpoint only returns EmployerProfile's fields — unlike
  // GET /employer/profile, it does not include _count/totalApplications.
  updateProfile: async (
    payload: UpdateEmployerProfileRequestDto
  ): Promise<EmployerProfileDto> => {
    const { data } = await apiClient.patch<EmployerProfileDto>(
      "/employer/profile",
      payload
    );
    return data;
  },

  listJobs: async (
    status?: JobStatus,
    opts?: RequestOptions
  ): Promise<EmployerJobsResponseDto> => {
    const { data } = await apiClient.get<EmployerJobsResponseDto>(
      "/employer/jobs",
      {
        params: status ? { status } : undefined,
        signal: opts?.signal,
      }
    );
    return data;
  },

  listJobApplications: async (
    jobId: string,
    params: {
      status?: ApplicationStatus;
      page?: number;
      limit?: number;
    } = {},
    opts?: RequestOptions
  ): Promise<EmployerJobApplicationsResponseDto> => {
    const { data } = await apiClient.get<EmployerJobApplicationsResponseDto>(
      `/employer/jobs/${jobId}/applications`,
      { params, signal: opts?.signal }
    );
    return data;
  },

  // responseType: "blob" — the backend returns a raw text/csv body, not
  // JSON, same reasoning as interviewRepository.getIcs.
  exportJobApplicantsCsv: async (jobId: string): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(
      `/employer/jobs/${jobId}/applications/export`,
      { responseType: "blob" }
    );
    return data;
  },

  listRecentApplications: async (
    opts?: RequestOptions
  ): Promise<EmployerRecentApplicationsResponseDto> => {
    const { data } = await apiClient.get<EmployerRecentApplicationsResponseDto>(
      "/employer/applications/recent",
      { signal: opts?.signal }
    );
    return data;
  },

  getHiringFunnel: async (
    opts?: RequestOptions
  ): Promise<HiringFunnelResponseDto> => {
    const { data } = await apiClient.get<HiringFunnelResponseDto>(
      "/employer/analytics/funnel",
      { signal: opts?.signal }
    );
    return data;
  },

  getDashboard: async (
    opts?: RequestOptions
  ): Promise<EmployerDashboardResponseDto> => {
    const { data } = await apiClient.get<EmployerDashboardResponseDto>(
      "/employer/dashboard",
      { signal: opts?.signal }
    );
    return data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<void> => {
    await apiClient.patch(`/employer/applications/${applicationId}`, {
      status,
      notes,
    });
  },

  bulkUpdateApplicationStatus: async (
    ids: string[],
    status: ApplicationStatus,
    notes?: string
  ): Promise<BulkUpdateApplicationsResponseDto> => {
    const { data } = await apiClient.patch<BulkUpdateApplicationsResponseDto>(
      "/employer/applications/bulk",
      { ids, status, notes }
    );
    return data;
  },

  submitVerification: async (
    payload: SubmitVerificationRequestDto
  ): Promise<SubmitVerificationResponseDto> => {
    const { data } = await apiClient.post<SubmitVerificationResponseDto>(
      "/employer/verification",
      payload
    );
    return data;
  },

  confirmVerification: async (
    payload: ConfirmVerificationRequestDto
  ): Promise<ConfirmVerificationResponseDto> => {
    const { data } = await apiClient.post<ConfirmVerificationResponseDto>(
      "/employer/verification/confirm",
      payload
    );
    return data;
  },

  getPublicProfile: async (
    slug: string,
    opts?: RequestOptions
  ): Promise<PublicCompanyProfileDto> => {
    const { data } = await apiClient.get<PublicCompanyProfileDto>(
      `/companies/${slug}`,
      { signal: opts?.signal }
    );
    return data;
  },
};
