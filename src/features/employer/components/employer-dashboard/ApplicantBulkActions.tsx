import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { NEXT_LABEL } from "@/features/employer/employer-dashboard.utils";
import type { ApplicationStatus } from "@/types/application";
import { useTranslation } from "@/i18n/useTranslation";

export interface ApplicantBulkActionsProps {
  allEligibleSelected: boolean;
  eligibleCount: number;
  selectedCount: number;
  commonStatus: ApplicationStatus | null;
  bulkNextStatus?: ApplicationStatus;
  canShortlist?: boolean;
  isPending: boolean;
  onToggleSelectAll: () => void;
  onBulkUpdate: (status: ApplicationStatus, note?: string) => void;
}

export const ApplicantBulkActions = ({
  allEligibleSelected,
  eligibleCount,
  selectedCount,
  commonStatus,
  bulkNextStatus,
  canShortlist,
  isPending,
  onToggleSelectAll,
  onBulkUpdate,
}: ApplicantBulkActionsProps) => {
  const { t } = useTranslation("employer");
  return (
    // PB59 AC2: with a selection, the toolbar docks to the bottom of the
    // viewport. It is `fixed`, not `sticky`: it renders above the list, and a
    // sticky element can only be pulled up, never down to the viewport bottom.
    // The wrapper keeps its place in the flow so the list doesn't jump.
    <div className={cn(selectedCount > 0 && "mb-1 h-5")}>
      <div
        className={cn(
          "mb-1 flex items-center gap-2.5 px-2",
          selectedCount > 0 &&
            "fixed inset-x-4 bottom-4 z-20 mx-auto mb-0 max-w-3xl rounded-12 border border-neutral-200 bg-white py-2 shadow-card"
        )}
        role="toolbar"
        aria-label={t("bulk.toolbar")}
      >
        <input
          aria-label={t("bulk.selectAll")}
          checked={allEligibleSelected}
          className="h-4 w-4 shrink-0 accent-brand-600 disabled:opacity-30"
          disabled={eligibleCount === 0}
          title={t("bulk.selectAllTitle")}
          type="checkbox"
          onChange={onToggleSelectAll}
        />
        {selectedCount > 0 ? (
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] text-neutral-500">
              {t("bulk.selected", { count: selectedCount })}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {bulkNextStatus && commonStatus && (
                <ConfirmAction
                  confirmLabel={NEXT_LABEL[commonStatus]}
                  isPending={isPending}
                  message={t("bulk.advanceQ", {
                    action: NEXT_LABEL[commonStatus],
                    count: selectedCount,
                  })}
                  notePlaceholder={t("bulk.note")}
                  pendingLabel={t("bulk.updating")}
                  onConfirm={(note) => onBulkUpdate(bulkNextStatus, note)}
                >
                  {({ onClick }) => (
                    <button
                      className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11.5px] font-medium text-brand-700 transition-colors hover:bg-brand-50 focus-visible:shadow-focus focus-visible:outline-none"
                      type="button"
                      onClick={onClick}
                    >
                      <Check size={12} />{" "}
                      {t("bulk.actionSelected", {
                        action: NEXT_LABEL[commonStatus],
                      })}
                    </button>
                  )}
                </ConfirmAction>
              )}
              {canShortlist && bulkNextStatus !== "SHORTLISTED" && (
                <ConfirmAction
                  confirmLabel={t("bulk.shortlist")}
                  isPending={isPending}
                  message={t("bulk.shortlistQ", { count: selectedCount })}
                  notePlaceholder={t("bulk.note")}
                  pendingLabel={t("bulk.updating")}
                  onConfirm={(note) => onBulkUpdate("SHORTLISTED", note)}
                >
                  {({ onClick }) => (
                    <button
                      className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:shadow-focus focus-visible:outline-none"
                      type="button"
                      onClick={onClick}
                    >
                      <Check size={12} /> {t("bulk.shortlistSelected")}
                    </button>
                  )}
                </ConfirmAction>
              )}
              <ConfirmAction
                confirmLabel={t("bulk.reject")}
                isPending={isPending}
                message={t("bulk.rejectQ", { count: selectedCount })}
                noteLabel={t("decision.rejectReason")}
                notePlaceholder={t("decision.rejectReasonPlaceholder")}
                pendingLabel={t("bulk.rejecting")}
                onConfirm={(note) => onBulkUpdate("REJECTED", note)}
              >
                {({ onClick }) => (
                  <button
                    className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11.5px] font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:shadow-focus focus-visible:outline-none"
                    type="button"
                    onClick={onClick}
                  >
                    <X size={12} /> {t("bulk.rejectSelected")}
                  </button>
                )}
              </ConfirmAction>
            </div>
          </div>
        ) : (
          <span className="text-[12px] text-neutral-400">
            {t("bulk.selectHint")}
          </span>
        )}
      </div>
    </div>
  );
};
