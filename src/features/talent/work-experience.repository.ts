import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CreateWorkExperiencePayload,
  UpdateWorkExperiencePayload,
  WorkExperience,
} from "@/types/work-experience";

export const workExperienceRepository = {
  list: async (opts?: RequestOptions): Promise<WorkExperience[]> => {
    const { data } = await apiClient.get<WorkExperience[]>(
      "/talent/me/experience",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },

  create: async (
    payload: CreateWorkExperiencePayload
  ): Promise<WorkExperience> => {
    const { data } = await apiClient.post<WorkExperience>(
      "/talent/me/experience",
      payload
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateWorkExperiencePayload
  ): Promise<WorkExperience> => {
    const { data } = await apiClient.patch<WorkExperience>(
      `/talent/me/experience/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/talent/me/experience/${id}`);
  },
};
