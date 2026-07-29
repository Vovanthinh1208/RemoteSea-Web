import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAlerts } from "@/features/alerts/alerts.queries";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import type { JobAlert } from "@/types/alert";

const DASHBOARD_ALERTS_LIMIT = 4;

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
  const { data: alerts } = useAlerts();
  const visible = alerts?.slice(0, DASHBOARD_ALERTS_LIMIT) ?? [];

  return (
    <div className="mb-5 overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-neutral-900">Saved searches</h3>
        <Link
          className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:text-brand-700"
          to={ROUTES.alerts}
        >
          <Plus size={12} /> New
        </Link>
      </div>
      <div>
        {visible.length === 0 ? (
          <p className="px-5 py-4 text-[12.5px] text-neutral-400">No saved searches yet.</p>
        ) : (
          visible.map((alert) => (
            <div
              className="flex items-center justify-between gap-3 border-b border-neutral-50 px-5 py-3.5 last:border-none"
              key={alert.id}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-neutral-900">{alert.name}</p>
                <p className="truncate text-[11.5px] text-neutral-400">{summarizeAlert(alert)}</p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  alert.isActive ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-neutral-400"
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
