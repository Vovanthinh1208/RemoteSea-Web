import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/notification.queries";
import type { Notification } from "@/types/notification";
import { Pagination } from "@/features/jobs/components/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { timeAgoLong } from "@/utils/time";
import { cn } from "@/utils/cn";

const NOTIFICATIONS_LIMIT = 20;
const SKELETON_COUNT = 6;

const NotificationRowSkeleton = () => (
  <div className="flex items-start gap-3 border-b border-neutral-100 px-4 py-4 last:border-0">
    <Skeleton className="mt-0.5 h-2 w-2 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3.5 w-5/6" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

const NotificationRow = ({ notification }: { notification: Notification }) => {
  const markRead = useMarkNotificationRead();
  const navigate = useNavigate();
  const isUnread = !notification.readAt;

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
      <span
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          isUnread ? "bg-brand-600" : "bg-transparent"
        )}
      />
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

export const NotificationsPage = () => {
  useDocumentTitle("Notifications");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useNotifications(
    page,
    NOTIFICATIONS_LIMIT
  );
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
            Notifications
          </h1>
          <p className="text-[15px] text-neutral-500">
            Updates on invitations, application status, and reports you've
            filed.
          </p>
        </div>
        {hasUnread && (
          <Button
            disabled={markAllRead.isPending}
            isLoading={markAllRead.isPending}
            size="sm"
            variant="outline"
            onClick={() => markAllRead.mutate()}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="overflow-hidden rounded-16 border border-neutral-100">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <NotificationRowSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          action={
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
          description="Something went wrong loading your notifications."
          title="Couldn't load notifications"
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          description="You'll see updates on invitations, application status, and reports here."
          title="No notifications yet"
        />
      ) : (
        <>
          <div className="divide-y divide-neutral-100 overflow-hidden rounded-16 border border-neutral-100">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </div>
          {data && (
            <Pagination
              page={data.pagination.page}
              pages={data.pagination.pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};
