import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  MarkAllReadResponseDto,
  NotificationDto,
  NotificationListResponseDto,
  UnreadCountResponseDto,
} from "@/features/notifications/notification.dto";

export const notificationRepository = {
  list: async (
    page: number,
    limit: number,
    opts?: RequestOptions
  ): Promise<NotificationListResponseDto> => {
    const { data } = await apiClient.get<NotificationListResponseDto>(
      "/notifications",
      { params: { page, limit }, signal: opts?.signal }
    );
    return data;
  },

  unreadCount: async (
    opts?: RequestOptions
  ): Promise<UnreadCountResponseDto> => {
    const { data } = await apiClient.get<UnreadCountResponseDto>(
      "/notifications/unread-count",
      { signal: opts?.signal }
    );
    return data;
  },

  markRead: async (id: string): Promise<NotificationDto> => {
    const { data } = await apiClient.patch<NotificationDto>(
      `/notifications/${id}/read`
    );
    return data;
  },

  markAllRead: async (): Promise<MarkAllReadResponseDto> => {
    const { data } = await apiClient.patch<MarkAllReadResponseDto>(
      "/notifications/read-all"
    );
    return data;
  },
};
