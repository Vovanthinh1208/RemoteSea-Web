import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  ApplicationDto,
  ApplicationListResponseDto,
  ApplicationStatusCountsDto,
  ApplyRequestDto,
} from "@/features/applications/applications.dto";

export const applicationsRepository = {
  apply: async (payload: ApplyRequestDto): Promise<ApplicationDto> => {
    const { data } = await apiClient.post<ApplicationDto>("/applications", payload);
    return data;
  },

  listMine: async (
    page: number,
    limit: number,
    opts?: RequestOptions
  ): Promise<ApplicationListResponseDto> => {
    const { data } = await apiClient.get<ApplicationListResponseDto>("/applications", {
      params: { page, limit },
      signal: opts?.signal,
    });
    return data;
  },

  getStatusCounts: async (opts?: RequestOptions): Promise<ApplicationStatusCountsDto> => {
    const { data } = await apiClient.get<ApplicationStatusCountsDto>("/applications/stats", {
      signal: opts?.signal,
    });
    return data;
  },

  listMyApplicationIds: async (opts?: RequestOptions): Promise<{ jobIds: string[] }> => {
    const { data } = await apiClient.get<{ jobIds: string[] }>("/applications/ids", {
      signal: opts?.signal,
    });
    return data;
  },
};
