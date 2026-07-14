import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { SavedJobIdsResponseDto, SavedJobListResponseDto } from "@/features/saved/saved.dto";

export const savedRepository = {
  list: async (
    page: number,
    limit: number,
    opts?: RequestOptions
  ): Promise<SavedJobListResponseDto> => {
    const { data } = await apiClient.get<SavedJobListResponseDto>("/saved", {
      params: { page, limit },
      signal: opts?.signal,
    });
    return data;
  },

  listIds: async (opts?: RequestOptions): Promise<SavedJobIdsResponseDto> => {
    const { data } = await apiClient.get<SavedJobIdsResponseDto>("/saved/ids", {
      signal: opts?.signal,
    });
    return data;
  },

  save: async (jobId: string): Promise<{ saved: boolean }> => {
    const { data } = await apiClient.put<{ saved: boolean }>(`/saved/${jobId}`);
    return data;
  },

  unsave: async (jobId: string): Promise<{ saved: boolean }> => {
    const { data } = await apiClient.delete<{ saved: boolean }>(`/saved/${jobId}`);
    return data;
  },
};
