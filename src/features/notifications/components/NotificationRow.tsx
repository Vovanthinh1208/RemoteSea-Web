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

  const handleClick = () => {
    if (isUnread) markRead.mutate(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <button
      className={cn(
        "flex w-full items-start gap-3.5 px-4 py-4 text-left transition-colors hover:bg-neutral-50",
        isUnread && "bg-brand-50/60"
      )}
      type="button"
      onClick={handleClick}
    >
      <span
        className={cn(
          "grid h-10 w-10 flex-shrink-0 place-items-center rounded-full",
          EVENT_BULLET_CLASS[notification.type]
        )}
      >
        <TypeIcon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[14.5px] text-neutral-900",
            isUnread ? "font-semibold" : "font-medium"
          )}
        >
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
      {isUnread && (
        <span
          aria-hidden="true"
          className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-600"
        />
      )}
    </button>
  );
};
