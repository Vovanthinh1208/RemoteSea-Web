import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationListResponse,
} from "@/features/notifications/notification.service";
import { useAuth } from "@/contexts/AuthContext";
import { notificationKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

const UNREAD_COUNT_POLL_MS = 30_000;

// `poll`: NotificationBell passes true so its badge (unreadCount, bundled in
// this same response — see notifications.service.ts's listForUser) stays live
// without a second GET /notifications/unread-count request. NotificationsPage
// leaves it off — no reason to re-fetch a page the user is actively reading
// every 30s.
export const useNotifications = (
  page: number,
  limit: number,
  options?: { poll?: boolean }
) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: ({ signal }) => listNotifications(page, limit, { signal }),
    enabled: !!user,
    // Backs a real Pagination control on NotificationsPage — without this,
    // clicking to the next page flashes the full skeleton instead of
    // keeping the current page visible during the transition, same as
    // jobs.queries.ts/talent-search.queries.ts's paginated lists.
    placeholderData: keepPreviousData,
    ...TIER.live,
    refetchInterval: options?.poll ? UNREAD_COUNT_POLL_MS : undefined,
  });
};

// Standalone count-only fetch — kept for any caller that wants just the
// badge number without the notification list itself (e.g. a lighter-weight
// surface than NotificationBell). NotificationBell no longer uses this: it
// gets unreadCount bundled from useNotifications instead, so it doesn't fire
// both requests on every render.
export const useUnreadNotificationCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: ({ signal }) => getUnreadNotificationCount({ signal }),
    enabled: !!user,
    ...TIER.live,
    refetchInterval: UNREAD_COUNT_POLL_MS,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id: string) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationKeys.listsPrefix }),
        queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
      ]);

      const previousLists =
        queryClient.getQueriesData<NotificationListResponse>({
          queryKey: notificationKeys.listsPrefix,
        });
      const previousCount = queryClient.getQueryData<number>(
        notificationKeys.unreadCount()
      );

      // Both callers (NotificationBell, NotificationsPage) only invoke this
      // mutation from a row they're currently rendering as unread — the
      // notification object came from one of the caches below in the first
      // place — so the decrement doesn't need to re-derive "was it unread"
      // by scanning the cache for it; that's already guaranteed.
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.listsPrefix },
        (old) => {
          if (!old) return old;
          // Every cached list response's unreadCount mirrors the same
          // global per-user count (see notifications.service.ts's
          // listForUser) — decremented unconditionally here, not just on
          // pages that happen to contain this notification.
          return {
            ...old,
            unreadCount: Math.max(0, old.unreadCount - 1),
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n
            ),
          };
        }
      );
      if (previousCount !== undefined) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          Math.max(0, previousCount - 1)
        );
      }

      return { previousLists, previousCount };
    },
    onError: (_err, _id, context) => {
      if (!context) return;
      context.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context.previousCount !== undefined) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousCount
        );
      }
    },
    onSettled: (_data, error) => {
      if (error) {
        void queryClient.invalidateQueries({
          queryKey: notificationKeys.listsPrefix,
        });
        void queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        });
      }
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationKeys.listsPrefix }),
        queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
      ]);

      const previousLists =
        queryClient.getQueriesData<NotificationListResponse>({
          queryKey: notificationKeys.listsPrefix,
        });
      const previousCount = queryClient.getQueryData<number>(
        notificationKeys.unreadCount()
      );

      const now = new Date().toISOString();
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.listsPrefix },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            unreadCount: 0,
            notifications: old.notifications.map((n) =>
              n.readAt ? n : { ...n, readAt: now }
            ),
          };
        }
      );
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);

      return { previousLists, previousCount };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      context.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context.previousCount !== undefined) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousCount
        );
      }
    },
    onSettled: (_data, error) => {
      if (error) {
        void queryClient.invalidateQueries({
          queryKey: notificationKeys.listsPrefix,
        });
        void queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        });
      }
    },
  });
};
