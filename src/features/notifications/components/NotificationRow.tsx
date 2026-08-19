import { useNavigate } from "react-router-dom";
import { useMarkNotificationRead } from "@/features/notifications/notification.queries";
import { EVENT_BULLET_CLASS, EVENT_ICON } from "@/utils/notification-icons";
import type { Notification } from "@/types/notification";
import { timeAgoLong } from "@/utils/time";
import { cn } from "@/utils/cn";

export const NotificationRow = ({
  notification,
}: {
  notification: Notification;
}) => {
  const markRead = useMarkNotificationRead();
  const navigate = useNavigate();
  const isUnread = !notification.readAt;
  const TypeIcon = EVENT_ICON[notification.type];

  // A single interactive element carrying both the read/unread background
  // and the hover state — always marks read, only navigates if there's a
  // link. Splitting these into a <Link> wrapping a separately-styled inner
  // div (an earlier version of this) made the wrapper's hover:bg invisible
  // (the inner div's own opaque background painted over it) and made
  // link-less notifications silently unclickable — same bug class
  // NotificationBell's row button already avoids by staying one element.
  const handleClick = () => {
    if (isUnread) markRead.mutate(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-neutral-50",
        isUnread && "bg-brand-50/60"
      )}
      type="button"
      onClick={handleClick}
    >
      {/* Same icon+color-by-type bullet as ActivityFeed's rows — the row-level
          unread tint above already carries the read/unread signal, so this
          slot is free to show what kind of event this is instead of just a
          plain dot. */}
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full",
          EVENT_BULLET_CLASS[notification.type]
        )}
      >
        <TypeIcon size={11} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-medium text-neutral-900">
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-[13.5px] text-neutral-600">
            {notification.body}
          </p>
        )}
        <p className="mt-1.5 text-[12px] text-neutral-400">
          {timeAgoLong(notification.createdAt)}
        </p>
      </div>
    </button>
  );
};
