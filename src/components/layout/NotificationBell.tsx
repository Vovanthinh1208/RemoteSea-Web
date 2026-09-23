import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/notification.queries";
import type { Notification } from "@/types/notification";
import { ROUTES } from "@/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { timeAgoShort } from "@/utils/time";
import { cn } from "@/utils/cn";
import { EVENT_ICON } from "@/utils/notification-icons";
import { useToastMutation } from "@/hooks/useToastMutation";

const PANEL_ITEM_LIMIT = 8;
const PANEL_SKELETON_COUNT = 3;
const MAX_BADGE_COUNT = 9;

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Bundled unreadCount from the same response — no separate
  // GET /notifications/unread-count round trip (see notifications.service.ts).
  // `poll: true` keeps the badge live while the panel is closed.
  const { data, isLoading } = useNotifications(1, PANEL_ITEM_LIMIT, {
    poll: true,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const runWithToast = useToastMutation();
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

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

  // Same fix as NotificationRow.tsx's own handleClick — a bare .mutate()
  // here left a failed mark-read (which optimistically reverts, see
  // useMarkNotificationRead) with no visible explanation.
  const handleRowClick = (notification: Notification) => {
    if (!notification.readAt) {
      void runWithToast(() => markRead.mutateAsync(notification.id), {
        error: "Couldn't mark as read",
      });
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label="Notifications"
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-8 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none",
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
                className="rounded-8 text-[12.5px] text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                disabled={markAllRead.isPending}
                type="button"
                onClick={() =>
                  void runWithToast(() => markAllRead.mutateAsync(), {
                    error: "Couldn't mark all as read",
                  })
                }
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
              <EmptyRow className="px-4">No notifications yet</EmptyRow>
            ) : (
              notifications.map((n) => {
                const TypeIcon = EVENT_ICON[n.type];
                return (
                  <button
                    key={n.id}
                    className={cn(
                      "flex w-full items-start gap-2.5 border-b border-neutral-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-neutral-50 focus-visible:relative focus-visible:z-10 focus-visible:shadow-focus focus-visible:outline-none",
                      !n.readAt && "bg-brand-50/60"
                    )}
                    type="button"
                    onClick={() => handleRowClick(n)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        n.readAt ? "bg-transparent" : "bg-brand-600"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      {/* min-w-0 on this row (not just its parent) is what
                          lets the inner span actually shrink — `truncate`
                          on the flex row itself doesn't reliably ellipsis
                          with an icon sibling in the mix. */}
                      <p className="flex min-w-0 items-center gap-1 text-[13px] font-medium text-neutral-900">
                        <TypeIcon
                          className="shrink-0 text-neutral-400"
                          size={11}
                        />
                        {!n.readAt && <span className="sr-only">Unread: </span>}
                        <span className="truncate">{n.title}</span>
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-neutral-400">
                        {timeAgoShort(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <Link
            className="block border-t border-neutral-100 px-4 py-2.5 text-center text-[12.5px] text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus-visible:relative focus-visible:z-10 focus-visible:shadow-focus focus-visible:outline-none"
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
