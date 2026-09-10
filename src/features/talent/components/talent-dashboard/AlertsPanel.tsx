import { Link } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { useAlerts } from "@/features/alerts/alerts.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import type { JobAlert } from "@/types/alert";

const DASHBOARD_ALERTS_LIMIT = 4;
const ALERTS_SKELETON_COUNT = 2;

const summarizeAlert = (alert: JobAlert): string =>
  [
    alert.keywords,
    ...alert.categories.map((c) => c.category.name),
    alert.timezone,
    alert.salaryMin ? `$${alert.salaryMin}+/mo` : null,
  ]
    .filter(Boolean)
    .join(" · ") || "All jobs";

export const AlertsPanel = () => {
  const { data: alerts, isLoading, isError, refetch } = useAlerts();
  const visible = alerts?.slice(0, DASHBOARD_ALERTS_LIMIT) ?? [];

  return (
    <div className="mb-5 overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-neutral-900">
          Saved searches
        </h3>
        <Link
          className="inline-flex items-center gap-1 rounded-8 text-[12px] font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          to={ROUTES.alerts}
        >
          <Plus size={12} /> New
        </Link>
      </div>
      <div>
        {isLoading ? (
          Array.from({ length: ALERTS_SKELETON_COUNT }, (_, i) => (
            <div
              className="flex items-center justify-between gap-3 border-b border-neutral-50 px-5 py-3.5 last:border-none"
              key={i}
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
              <Skeleton className="h-5 w-14 flex-shrink-0 rounded-full" />
            </div>
          ))
        ) : isError ? (
          // Was previously conflated with "no saved searches" — a fetch
          // failure rendered the exact same empty-state text as genuinely
          // having none, silently misreporting the error (matching the
          // loading -> error+retry -> empty structure ActivityFeed.tsx, the
          // sibling dashboard panel, already uses).
          <div className="flex items-center justify-between px-5 py-4 text-[12.5px] text-neutral-400">
            Couldn't load your saved searches.
            <button
              className="inline-flex items-center gap-1 rounded-8 font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
              type="button"
              onClick={() => refetch()}
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <p className="px-5 py-4 text-[12.5px] text-neutral-400">
            No saved searches yet.
          </p>
        ) : (
          visible.map((alert) => (
            <div
              className="flex items-center justify-between gap-3 border-b border-neutral-50 px-5 py-3.5 last:border-none"
              key={alert.id}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-neutral-900">
                  {alert.name}
                </p>
                <p className="truncate text-[11.5px] text-neutral-400">
                  {summarizeAlert(alert)}
                </p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  alert.isActive
                    ? "bg-brand-50 text-brand-700"
                    : "bg-neutral-100 text-neutral-400"
                )}
              >
                {alert.isActive ? "Active" : "Paused"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
