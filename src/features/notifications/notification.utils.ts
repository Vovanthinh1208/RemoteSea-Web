import { dayKeyOf, relativeDayLabel } from "@/utils/time";
import type { Notification } from "@/types/notification";

export interface NotificationDayGroup {
  key: string;
  label: string;
  notifications: Notification[];
}

// Notifications arrive newest-first (see notification.service.ts) — this
// walks that order once, grouping consecutive same-day notifications
// together, rather than re-sorting. Same idea as message.utils.ts's
// groupMessagesByDay, applied to the notifications feed.
export const groupNotificationsByDay = (
  notifications: Notification[]
): NotificationDayGroup[] => {
  const groups: NotificationDayGroup[] = [];
  for (const notification of notifications) {
    const key = dayKeyOf(new Date(notification.createdAt));
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.notifications.push(notification);
    } else {
      groups.push({
        key,
        label: relativeDayLabel(notification.createdAt, "yesterday"),
        notifications: [notification],
      });
    }
  }
  return groups;
};
