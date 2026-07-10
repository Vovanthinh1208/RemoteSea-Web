import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  ApplicationDto,
  ApplicationWithJobDto,
  ApplyRequestDto,
} from "@/features/applications/applications.dto";

export const applicationsRepository = {
  apply: async (payload: ApplyRequestDto): Promise<ApplicationDto> => {
    const { data } = await apiClient.post<ApplicationDto>("/applications", payload);
    return data;
  },

  listMine: async (opts?: RequestOptions): Promise<ApplicationWithJobDto[]> => {
    const { data } = await apiClient.get<ApplicationWithJobDto[]>("/applications", {
      signal: opts?.signal,
    });
    return data;
  },
};
