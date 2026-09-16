import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  ApplicationDto,
  ApplicationListResponseDto,
  ApplicationStatusCountsDto,
  ApplicationWithJobDto,
  ApplyRequestDto,
} from "@/features/applications/applications.dto";

export const applicationsRepository = {
  apply: async (payload: ApplyRequestDto): Promise<ApplicationDto> => {
    const { data } = await apiClient.post<ApplicationDto>(
      "/applications",
      payload
    );
    return data;
  },

  getById: async (
    id: string,
    opts?: RequestOptions
  ): Promise<ApplicationWithJobDto> => {
    const { data } = await apiClient.get<ApplicationWithJobDto>(
      `/applications/${id}`,
      { signal: opts?.signal }
    );
    return data;
  },

  listMine: async (
    page: number,
    limit: number,
    opts?: RequestOptions
  ): Promise<ApplicationListResponseDto> => {
    const { data } = await apiClient.get<ApplicationListResponseDto>(
      "/applications",
      {
        params: { page, limit },
        signal: opts?.signal,
      }
    );
    return data;
  },

  getStatusCounts: async (
    opts?: RequestOptions
  ): Promise<ApplicationStatusCountsDto> => {
    const { data } = await apiClient.get<ApplicationStatusCountsDto>(
      "/applications/stats",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },

  listMyApplicationIds: async (
    opts?: RequestOptions
  ): Promise<{ jobIds: string[] }> => {
    const { data } = await apiClient.get<{ jobIds: string[] }>(
      "/applications/ids",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },

  withdraw: async (id: string): Promise<ApplicationWithJobDto> => {
    const { data } = await apiClient.patch<ApplicationWithJobDto>(
      `/applications/${id}/withdraw`
    );
    return data;
  },

  respondToOffer: async (
    id: string,
    response: "ACCEPTED" | "DECLINED"
  ): Promise<ApplicationWithJobDto> => {
    const { data } = await apiClient.patch<ApplicationWithJobDto>(
      `/applications/${id}/offer-response`,
      { response }
    );
    return data;
  },
};
