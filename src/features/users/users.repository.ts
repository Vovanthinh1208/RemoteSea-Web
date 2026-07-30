import { apiClient } from "@/core/http/http-client";
import type {
  AccountFieldsDto,
  ChangePasswordRequestDto,
  ConnectionDto,
  ExportDataDto,
  NotificationPreferencesDto,
  PauseStateDto,
  RevokeOtherSessionsResponseDto,
  SessionDto,
  UpdateAccountPayload,
  UpdateNotificationPreferencesPayload,
  UpdatedUserDto,
} from "@/features/users/users.dto";

export const usersRepository = {
  updateMyName: async (name: string): Promise<UpdatedUserDto> => {
    const { data } = await apiClient.patch<UpdatedUserDto>(
      "/users/me",
      { name }
    );
    return data;
  },

  changeMyPassword: async (
    payload: ChangePasswordRequestDto
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
      "/users/me/password",
      payload
    );
    return data;
  },

  deleteMyAccount: async (): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      "/users/me"
    );
    return data;
  },

  getAccount: async (): Promise<AccountFieldsDto> => {
    const { data } = await apiClient.get<AccountFieldsDto>(
      "/users/me/account"
    );
    return data;
  },

  updateAccount: async (
    payload: UpdateAccountPayload
  ): Promise<AccountFieldsDto> => {
    const { data } = await apiClient.patch<AccountFieldsDto>(
      "/users/me/account",
      payload
    );
    return data;
  },

  getNotificationPreferences:
    async (): Promise<NotificationPreferencesDto> => {
      const { data } =
        await apiClient.get<NotificationPreferencesDto>(
          "/users/me/notification-preferences"
        );
      return data;
    },

  updateNotificationPreferences: async (
    payload: UpdateNotificationPreferencesPayload
  ): Promise<NotificationPreferencesDto> => {
    const { data } =
      await apiClient.patch<NotificationPreferencesDto>(
        "/users/me/notification-preferences",
        payload
      );
    return data;
  },

  getPauseState: async (): Promise<PauseStateDto> => {
    const { data } =
      await apiClient.get<PauseStateDto>("/users/me/pause");
    return data;
  },

  pauseAccount: async (): Promise<PauseStateDto> => {
    const { data } =
      await apiClient.post<PauseStateDto>("/users/me/pause");
    return data;
  },

  reactivateAccount: async (): Promise<PauseStateDto> => {
    const { data } = await apiClient.post<PauseStateDto>(
      "/users/me/reactivate"
    );
    return data;
  },

  exportData: async (): Promise<ExportDataDto> => {
    const { data } = await apiClient.get<ExportDataDto>(
      "/users/me/export"
    );
    return data;
  },

  listConnections: async (): Promise<ConnectionDto[]> => {
    const { data } = await apiClient.get<ConnectionDto[]>(
      "/users/me/connections"
    );
    return data;
  },

  disconnectConnection: async (
    provider: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/users/me/connections/${provider}`
    );
    return data;
  },

  listSessions: async (): Promise<SessionDto[]> => {
    const { data } = await apiClient.get<SessionDto[]>(
      "/users/me/sessions"
    );
    return data;
  },

  revokeSession: async (
    id: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/users/me/sessions/${id}`
    );
    return data;
  },

  revokeOtherSessions:
    async (): Promise<RevokeOtherSessionsResponseDto> => {
      const { data } =
        await apiClient.delete<RevokeOtherSessionsResponseDto>(
          "/users/me/sessions"
        );
      return data;
    },
};
