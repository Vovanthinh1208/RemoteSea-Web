import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { ListActivityResponseDto } from "@/features/talent/activity.dto";

export const activityRepository = {
  list: async (opts?: RequestOptions): Promise<ListActivityResponseDto> => {
    const { data } = await apiClient.get<ListActivityResponseDto>(
      "/talent/me/activity",
      { signal: opts?.signal }
    );
    return data;
  },
};
