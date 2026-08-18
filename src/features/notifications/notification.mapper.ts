import type {
  NotificationDto,
  NotificationListResponseDto,
} from "@/features/notifications/notification.dto";
import type { Notification } from "@/types/notification";
import type { PaginationMeta } from "@/core/pagination/pagination";

export const toNotification = (dto: NotificationDto): Notification => dto;

export type NotificationListResponse = {
  notifications: Notification[];
  pagination: PaginationMeta;
};

export const toNotificationListResponse = (
  dto: NotificationListResponseDto
): NotificationListResponse => ({
  notifications: dto.notifications.map(toNotification),
  pagination: dto.pagination,
});
