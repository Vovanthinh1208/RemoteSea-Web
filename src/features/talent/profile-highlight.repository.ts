import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CreateProfileHighlightPayload,
  ProfileHighlight,
  UpdateProfileHighlightPayload,
} from "@/types/profile-highlight";

export const profileHighlightRepository = {
  list: async (opts?: RequestOptions): Promise<ProfileHighlight[]> => {
    const { data } = await apiClient.get<ProfileHighlight[]>(
      "/talent/me/highlights",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },

  create: async (
    payload: CreateProfileHighlightPayload
  ): Promise<ProfileHighlight> => {
    const { data } = await apiClient.post<ProfileHighlight>(
      "/talent/me/highlights",
      payload
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateProfileHighlightPayload
  ): Promise<ProfileHighlight> => {
    const { data } = await apiClient.patch<ProfileHighlight>(
      `/talent/me/highlights/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/talent/me/highlights/${id}`);
  },
};
