import { Bell, Trash2 } from "lucide-react";
import { PillToggle } from "@/components/shared/PillToggle";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import type { JobAlert } from "@/types/alert";

interface AlertListItemProps {
  alert: JobAlert;
  onToggleActive: (alert: JobAlert) => void;
  onDelete: (alert: JobAlert) => Promise<void> | void;
  isDeleting?: boolean;
}

const summarizeAlert = (alert: JobAlert): string =>
  [
    alert.keywords,
    alert.jobType?.replace("_", " ").toLowerCase(),
    alert.level?.toLowerCase(),
    alert.salaryMin ? `$${alert.salaryMin}+/mo` : null,
    alert.frequency.toLowerCase(),
    ...alert.categories.map((c) => c.category.name),
  ]
    .filter(Boolean)
    .join(" · ") || "All jobs";

export const AlertListItem = ({
  alert,
  onToggleActive,
  onDelete,
  isDeleting,
}: AlertListItemProps) => (
  <div className="flex items-center gap-4 rounded-16 border border-neutral-100 bg-white p-4 shadow-card">
    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
      <Bell size={15} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[14px] font-medium text-neutral-900">{alert.name}</p>
      <p className="truncate text-[12px] text-neutral-400">
        {summarizeAlert(alert)}
      </p>
    </div>
    <PillToggle
      active={alert.isActive}
      activeClassName="bg-brand-50 text-brand-700"
      className="px-2.5 py-1 text-[11px] font-medium"
      inactiveClassName="bg-neutral-100 text-neutral-500"
      onClick={() => onToggleActive(alert)}
    >
      {alert.isActive ? "Active" : "Paused"}
    </PillToggle>
    <ConfirmAction
      isPending={isDeleting}
      message="Delete this alert?"
      onConfirm={() => onDelete(alert)}
    >
      {({ onClick }) => (
        <button
          aria-label="Delete alert"
          className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={onClick}
        >
          <Trash2 size={15} />
        </button>
      )}
    </ConfirmAction>
  </div>
);
