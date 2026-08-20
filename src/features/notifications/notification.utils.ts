import type { Notification } from "@/types/notification";

const dayKeyOf = (d: Date): string =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const dayHeading = (iso: string): string => {
  const target = new Date(iso);
  const now = new Date();
  if (dayKeyOf(target) === dayKeyOf(now)) return "Today";
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );
  if (dayKeyOf(target) === dayKeyOf(yesterday)) return "Yesterday";
  return target.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

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
        label: dayHeading(notification.createdAt),
        notifications: [notification],
      });
    }
  }
  return groups;
};
