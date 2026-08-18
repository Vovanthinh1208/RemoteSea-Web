import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/features/notifications/notification.queries";
import type { Notification } from "@/types/notification";
import { ROUTES } from "@/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgoShort } from "@/utils/time";
import { cn } from "@/utils/cn";

const PANEL_ITEM_LIMIT = 8;
const PANEL_SKELETON_COUNT = 3;
const MAX_BADGE_COUNT = 9;

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading } = useNotifications(1, PANEL_ITEM_LIMIT);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.notifications ?? [];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleRowClick = (notification: Notification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label="Notifications"
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-8 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
          open && "bg-neutral-100 text-neutral-900"
        )}
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-medium leading-none text-white">
            {unreadCount > MAX_BADGE_COUNT ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[340px] animate-fade-up overflow-hidden rounded-12 border border-neutral-200 bg-white shadow-card-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <span className="text-[13.5px] font-semibold text-neutral-900">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                className="text-[12.5px] text-brand-600 transition-colors hover:text-brand-700"
                disabled={markAllRead.isPending}
                type="button"
                onClick={() => markAllRead.mutate()}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              // A skeleton instead of a "Loading…" message — otherwise this
              // looked like a near-identical flicker of the empty state right
              // before the real one, on a fast connection (same reasoning as
              // AlertsManager's skeleton).
              Array.from({ length: PANEL_SKELETON_COUNT }, (_, i) => (
                <div
                  className="flex items-start gap-2.5 border-b border-neutral-50 px-4 py-3 last:border-0"
                  key={i}
                >
                  <Skeleton className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-neutral-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    "flex w-full items-start gap-2.5 border-b border-neutral-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-neutral-50",
                    !n.readAt && "bg-brand-50/60"
                  )}
                  type="button"
                  onClick={() => handleRowClick(n)}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      n.readAt ? "bg-transparent" : "bg-brand-600"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-neutral-900">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-neutral-400">
                      {timeAgoShort(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <Link
            className="block border-t border-neutral-100 px-4 py-2.5 text-center text-[12.5px] text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            to={ROUTES.notifications}
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
};
