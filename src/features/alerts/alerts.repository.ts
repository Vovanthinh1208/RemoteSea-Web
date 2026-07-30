import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CreateAlertRequestDto,
  JobAlertDto,
} from "@/features/alerts/alerts.dto";

export const alertsRepository = {
  list: async (opts?: RequestOptions): Promise<JobAlertDto[]> => {
    const { data } = await apiClient.get<JobAlertDto[]>("/alerts", {
      signal: opts?.signal,
    });
    return data;
  },

  create: async (
    payload: CreateAlertRequestDto
  ): Promise<JobAlertDto> => {
    const { data } = await apiClient.post<JobAlertDto>(
      "/alerts",
      payload
    );
    return data;
  },

  setActive: async (
    id: string,
    isActive: boolean
  ): Promise<JobAlertDto> => {
    const { data } = await apiClient.patch<JobAlertDto>(
      `/alerts/${id}`,
      { isActive }
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/alerts/${id}`);
  },
};
