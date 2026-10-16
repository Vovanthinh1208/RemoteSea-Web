import { Bell, Trash2 } from "lucide-react";
import { PillToggle } from "@/components/shared/PillToggle";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import type { JobAlert } from "@/types/alert";
import { useTranslation } from "@/i18n/useTranslation";
import { translate } from "@/i18n/runtime";
import { filterValueLabel } from "@/features/jobs/jobs.utils";
import { JOB_TYPE_LABELS, LEVEL_LABELS } from "@/utils/labels";

interface AlertListItemProps {
  alert: JobAlert;
  onToggleActive: (alert: JobAlert) => void;
  onDelete: (alert: JobAlert) => Promise<void> | void;
  isDeleting?: boolean;
}

const summarizeAlert = (alert: JobAlert): string =>
  [
    alert.keywords,
    alert.jobType ? JOB_TYPE_LABELS[alert.jobType] : null,
    alert.level ? LEVEL_LABELS[alert.level] : null,
    alert.salaryMin
      ? `$${alert.salaryMin}+${translate("jobs.filters.perMonthSuffix")}`
      : null,
    translate(`alerts.freq.${alert.frequency}`),
    ...alert.categories.map((c) => filterValueLabel(c.category.name)),
  ]
    .filter(Boolean)
    .join(" · ") || translate("alerts.item.allJobs");

export const AlertListItem = ({
  alert,
  onToggleActive,
  onDelete,
  isDeleting,
}: AlertListItemProps) => {
  const { t } = useTranslation("alerts");
  return (
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
        {alert.isActive ? t("item.active") : t("item.paused")}
      </PillToggle>
      <ConfirmAction
        isPending={isDeleting}
        message={t("item.deleteQ")}
        onConfirm={() => onDelete(alert)}
      >
        {({ onClick }) => (
          <button
            aria-label={t("item.deleteAria")}
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
};
