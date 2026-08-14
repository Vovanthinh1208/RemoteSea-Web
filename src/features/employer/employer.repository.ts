import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { ApplicationStatus } from "@/types/application";
import type { JobStatus } from "@/types/job";
import type {
  CreateEmployerProfileRequestDto,
  CreateEmployerProfileResponseDto,
  EmployerJobApplicationsResponseDto,
  EmployerJobsResponseDto,
  EmployerProfileDto,
  EmployerProfileSummaryDto,
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
};
