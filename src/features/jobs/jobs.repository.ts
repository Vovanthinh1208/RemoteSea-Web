import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CreateJobRequestDto,
  CreateJobResponseDto,
  JobDto,
  JobListQueryParams,
  JobListResponseDto,
  UpdateJobRequestDto,
} from "@/features/jobs/jobs.dto";

export const jobsRepository = {
  list: async (
    params: JobListQueryParams,
    opts?: RequestOptions
  ): Promise<JobListResponseDto> => {
    const { data } = await apiClient.get<JobListResponseDto>("/jobs", {
      params,
      signal: opts?.signal,
    });
    return data;
  },

  getById: async (id: string, opts?: RequestOptions): Promise<JobDto> => {
    const { data } = await apiClient.get<JobDto>(`/jobs/${id}`, {
      signal: opts?.signal,
    });
    return data;
  },

  update: async (id: string, payload: UpdateJobRequestDto): Promise<void> => {
    await apiClient.patch(`/jobs/${id}`, payload);
  },

  close: async (id: string): Promise<void> => {
    await apiClient.patch(`/jobs/${id}/close`);
  },

  create: async (
    payload: CreateJobRequestDto
  ): Promise<CreateJobResponseDto> => {
    const { data } = await apiClient.post<CreateJobResponseDto>(
      "/jobs",
      payload
    );
    return data;
  },
};
