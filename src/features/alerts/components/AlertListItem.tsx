import { useState } from "react";
import { Bell, Pencil, Trash2 } from "lucide-react";
import { PillToggle } from "@/components/shared/PillToggle";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { CreateAlertForm } from "./CreateAlertForm";
import { Button } from "@/components/ui/button";
import type {
  CreateAlertPayload,
  JobAlert,
  UpdateAlertPayload,
} from "@/types/alert";
import { useTranslation } from "@/i18n/useTranslation";
import { JOB_TYPE_LABELS, LEVEL_LABELS } from "@/utils/labels";

interface AlertListItemProps {
  alert: JobAlert;
  onToggleActive: (alert: JobAlert) => void;
  onDelete: (alert: JobAlert) => Promise<void> | void;
  onUpdate?: (
    id: string,
    payload: UpdateAlertPayload
  ) => Promise<boolean | void> | void;
  isDeleting?: boolean;
  isToggling?: boolean;
}

export const AlertListItem = ({
  alert,
  onToggleActive,
  onDelete,
  onUpdate,
  isDeleting,
  isToggling,
}: AlertListItemProps) => {
  const { t } = useTranslation("alerts");
  const [isEditing, setIsEditing] = useState(false);
  const summary = [
    alert.keywords,
    alert.country,
    alert.jobType && JOB_TYPE_LABELS[alert.jobType],
    alert.level && LEVEL_LABELS[alert.level],
    alert.salaryMin && `$${alert.salaryMin}+`,
    t(`freq.${alert.frequency}`),
    ...alert.categories.map((c) => c.category.name),
  ]
    .filter(Boolean)
    .join(" · ");
  const save = async (payload: CreateAlertPayload): Promise<boolean> => {
    if (!onUpdate) return false;
    const success = await onUpdate(alert.id, {
      ...payload,
      keywords: payload.keywords ?? null,
      jobType: payload.jobType ?? null,
      level: payload.level ?? null,
      country: payload.country ?? null,
      salaryMin: payload.salaryMin ?? null,
      categoryIds: payload.categoryIds ?? [],
    });
    if (success === false) return false;
    setIsEditing(false);
    return true;
  };
  return (
    <article
      aria-label={alert.name}
      className="rounded-16 border border-neutral-100 bg-white p-4 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Bell size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-[14px] font-medium text-neutral-900">
            {alert.name}
          </p>
          <p className="truncate text-[12px] text-neutral-400">{summary}</p>
        </div>
        <PillToggle
          active={alert.isActive}
          activeClassName="bg-brand-50 text-brand-700"
          inactiveClassName="bg-neutral-100 text-neutral-500"
          className="px-2.5 py-1 text-[11px] font-medium"
          disabled={isToggling}
          onClick={() => onToggleActive(alert)}
        >
          {alert.isActive ? t("item.active") : t("item.paused")}
        </PillToggle>
        {onUpdate && (
          <button
            aria-label={t("item.edit")}
            className="p-2 text-neutral-500"
            type="button"
            onClick={() => setIsEditing((v) => !v)}
          >
            <Pencil size={15} />
          </button>
        )}
        <ConfirmAction
          isPending={isDeleting}
          message={t("item.deleteQ")}
          onConfirm={() => onDelete(alert)}
        >
          {({ onClick }) => (
            <button
              aria-label={t("item.deleteAria")}
              disabled={isDeleting}
              className="p-2 text-neutral-500"
              type="button"
              onClick={onClick}
            >
              <Trash2 size={15} />
            </button>
          )}
        </ConfirmAction>
      </div>
      {isEditing && (
        <div className="mt-4 border-t pt-3">
          <CreateAlertForm initialAlert={alert} onCreate={save} />
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            {t("common.actions.cancel")}
          </Button>
        </div>
      )}
    </article>
  );
};
