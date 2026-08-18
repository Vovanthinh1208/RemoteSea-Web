import type { RequestOptions } from "@/core/http/request-config";
import { notificationRepository } from "@/features/notifications/notification.repository";
import {
  toNotification,
  toNotificationListResponse,
  type NotificationListResponse,
} from "@/features/notifications/notification.mapper";
import type { Notification } from "@/types/notification";

export type { NotificationListResponse };

export const listNotifications = async (
  page: number,
  limit: number,
  opts?: RequestOptions
): Promise<NotificationListResponse> =>
  toNotificationListResponse(
    await notificationRepository.list(page, limit, opts)
  );

export const getUnreadNotificationCount = async (
  opts?: RequestOptions
): Promise<number> => (await notificationRepository.unreadCount(opts)).count;

export const markNotificationRead = async (id: string): Promise<Notification> =>
  toNotification(await notificationRepository.markRead(id));

export const markAllNotificationsRead = async (): Promise<number> =>
  (await notificationRepository.markAllRead()).updated;
