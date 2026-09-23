import type { Notification } from "@/types/notification";
import type { PaginationMeta } from "@/core/pagination/pagination";

export type NotificationDto = Notification;

export type NotificationListResponseDto = {
  notifications: NotificationDto[];
  unreadCount: number;
  pagination: PaginationMeta;
};

export type UnreadCountResponseDto = { count: number };

export type MarkAllReadResponseDto = { updated: number };
