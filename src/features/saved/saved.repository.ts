import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { SavedJobDto } from "@/features/saved/saved.dto";

export const savedRepository = {
  list: async (opts?: RequestOptions): Promise<SavedJobDto[]> => {
    const { data } = await apiClient.get<SavedJobDto[]>("/saved", { signal: opts?.signal });
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
