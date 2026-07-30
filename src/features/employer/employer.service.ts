import type { RequestOptions } from "@/core/http/request-config";
import { employerRepository } from "@/features/employer/employer.repository";
import {
  toEmployerJobApplicationsResponse,
  toEmployerJobsResponse,
  toEmployerProfile,
  toEmployerProfileSummary,
} from "@/features/employer/employer.mapper";
import type {
  CreateEmployerProfileRequestDto,
  UpdateEmployerProfileRequestDto,
} from "@/features/employer/employer.dto";
import type { ApplicationStatus } from "@/types/application";
import type { JobStatus } from "@/types/job";
import type {
  EmployerJobApplicationsResponse,
  EmployerJobsResponse,
  EmployerProfile,
  EmployerProfileSummary,
} from "@/types/employer";

export const createEmployerProfile = async (
  payload: CreateEmployerProfileRequestDto
): Promise<{ id: string; slug: string; companyName: string }> =>
  employerRepository.createProfile(payload);

export const getEmployerProfile = async (
  opts?: RequestOptions
): Promise<EmployerProfileSummary> =>
  toEmployerProfileSummary(await employerRepository.getProfile(opts));

export const updateEmployerProfile = async (
  payload: UpdateEmployerProfileRequestDto
): Promise<EmployerProfile> =>
  toEmployerProfile(await employerRepository.updateProfile(payload));

export const listEmployerJobs = async (
  status?: JobStatus,
  opts?: RequestOptions
): Promise<EmployerJobsResponse> =>
  toEmployerJobsResponse(
    await employerRepository.listJobs(status, opts)
  );

export const listJobApplications = async (
  jobId: string,
  params: {
    status?: ApplicationStatus;
    page?: number;
    limit?: number;
  } = {},
  opts?: RequestOptions
): Promise<EmployerJobApplicationsResponse> =>
  toEmployerJobApplicationsResponse(
    await employerRepository.listJobApplications(jobId, params, opts)
  );

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus,
  notes?: string
): Promise<void> =>
  employerRepository.updateApplicationStatus(
    applicationId,
    status,
    notes
  );
