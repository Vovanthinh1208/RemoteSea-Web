import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useTalentActivity } from "@/features/talent/activity.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import { timeAgoLong } from "@/utils/time";
import { EVENT_BULLET_CLASS, EVENT_ICON } from "@/utils/notification-icons";
import type { ActivityItem } from "@/types/activity";

const ActivityRow = ({ item }: { item: ActivityItem }) => {
  const navigate = useNavigate();
  const FeedIcon = EVENT_ICON[item.type];
  return (
    <button
      className="flex w-full gap-3 rounded-8 px-2 py-2.5 text-left transition-colors hover:bg-neutral-50"
      type="button"
      onClick={() => navigate(item.link)}
    >
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full",
          EVENT_BULLET_CLASS[item.type]
        )}
      >
        <FeedIcon size={10} />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] leading-relaxed text-neutral-700">
          <strong className="font-medium text-neutral-900">{item.title}</strong>
          {item.body && (
            <>
              {" — "}
              {item.body}
            </>
          )}
        </p>
        <span className="text-[11px] text-neutral-400">
          {timeAgoLong(item.createdAt)}
        </span>
      </div>
    </button>
  );
};

// Same bullet + two-line composition as the row it stands in for (see
// NotificationRowSkeleton's identical approach) — a shape-matched skeleton
// reads as "this list is loading," a generic bar just flickers.
const ActivityRowSkeleton = () => (
  <div className="flex gap-3 px-2 py-2.5">
    <Skeleton className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

const ACTIVITY_SKELETON_COUNT = 3;

export const ActivityFeed = () => {
  const { data: activity, isLoading, isError, refetch } = useTalentActivity();

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-neutral-900">Activity</h3>
      </div>
      <div className="p-3">
        {isLoading ? (
          Array.from({ length: ACTIVITY_SKELETON_COUNT }, (_, i) => (
            <ActivityRowSkeleton key={i} />
          ))
        ) : isError ? (
          <div className="flex items-center justify-between px-2 py-4 text-[12.5px] text-neutral-400">
            Couldn't load your activity.
            <button
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
              type="button"
              onClick={() => refetch()}
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        ) : activity && activity.length > 0 ? (
          activity.map((item) => <ActivityRow item={item} key={item.id} />)
        ) : (
          <p className="px-2 py-4 text-[12.5px] text-neutral-400">
            No activity yet.
          </p>
        )}
      </div>
    </div>
  );
};
