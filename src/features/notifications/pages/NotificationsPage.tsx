import { useState } from "react";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/features/notifications/notification.queries";
import { groupNotificationsByDay } from "@/features/notifications/notification.utils";
import { NotificationRow } from "@/features/notifications/components/NotificationRow";
import { NotificationRowSkeleton } from "@/features/notifications/components/NotificationRowSkeleton";
import { Pagination } from "@/features/jobs/components/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

const NOTIFICATIONS_LIMIT = 20;
const SKELETON_COUNT = 6;

export const NotificationsPage = () => {
  const { t } = useTranslation("notifications");
  useDocumentTitle(t("page.docTitle"));
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
            {t("page.title")}
          </h1>
          <p className="text-[15px] text-neutral-500">{t("page.desc")}</p>
        </div>
        {hasUnread && (
          <Button
            disabled={markAllRead.isPending}
            isLoading={markAllRead.isPending}
            size="sm"
            variant="outline"
            onClick={() => markAllRead.mutate()}
          >
            {t("page.markAll")}
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
              {t("common.actions.retry")}
            </Button>
          }
          description={t("page.errorDesc")}
          title={t("page.errorTitle")}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          description={t("page.emptyDesc")}
          title={t("page.emptyTitle")}
        />
      ) : (
        <>
          <div className="space-y-6">
            {groupNotificationsByDay(notifications).map((group) => (
              <div key={group.key}>
                <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-neutral-400">
                  {group.label}
                </h2>
                <div className="divide-y divide-neutral-100 overflow-hidden rounded-16 border border-neutral-100">
                  {group.notifications.map((n) => (
                    <NotificationRow key={n.id} notification={n} />
                  ))}
                </div>
              </div>
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
