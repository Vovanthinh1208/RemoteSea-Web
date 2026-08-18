import { useState } from "react";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/features/notifications/notification.queries";
import { NotificationRow } from "@/features/notifications/components/NotificationRow";
import { NotificationRowSkeleton } from "@/features/notifications/components/NotificationRowSkeleton";
import { Pagination } from "@/features/jobs/components/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const NOTIFICATIONS_LIMIT = 20;
const SKELETON_COUNT = 6;

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
