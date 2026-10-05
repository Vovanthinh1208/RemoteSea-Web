import { Check, X } from "lucide-react";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { NEXT_LABEL } from "@/features/employer/employer-dashboard.utils";
import type { ApplicationStatus } from "@/types/application";

export interface ApplicantBulkActionsProps {
  allEligibleSelected: boolean;
  eligibleCount: number;
  selectedCount: number;
  commonStatus: ApplicationStatus | null;
  bulkNextStatus?: ApplicationStatus;
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
  isPending,
  onToggleSelectAll,
  onBulkUpdate,
}: ApplicantBulkActionsProps) => {
  return (
    <div className="mb-1 flex items-center gap-2.5 px-2">
      <input
        aria-label="Select all eligible"
        checked={allEligibleSelected}
        className="h-4 w-4 shrink-0 accent-brand-600 disabled:opacity-30"
        disabled={eligibleCount === 0}
        title="Selects every applicant not already rejected or withdrawn"
        type="checkbox"
        onChange={onToggleSelectAll}
      />
      {selectedCount > 0 ? (
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] text-neutral-500">
            {selectedCount} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {bulkNextStatus && commonStatus && (
              <ConfirmAction
                confirmLabel={NEXT_LABEL[commonStatus]}
                isPending={isPending}
                message={`${NEXT_LABEL[commonStatus]} ${selectedCount} selected applicant${selectedCount === 1 ? "" : "s"}?`}
                notePlaceholder="Add a shared note (optional)"
                pendingLabel="Updating…"
                onConfirm={(note) => onBulkUpdate(bulkNextStatus, note)}
              >
                {({ onClick }) => (
                  <button
                    className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11.5px] font-medium text-brand-700 transition-colors hover:bg-brand-50 focus-visible:shadow-focus focus-visible:outline-none"
                    type="button"
                    onClick={onClick}
                  >
                    <Check size={12} /> {NEXT_LABEL[commonStatus]} selected
                  </button>
                )}
              </ConfirmAction>
            )}
            <ConfirmAction
              confirmLabel="Reject"
              isPending={isPending}
              message={`Reject ${selectedCount} selected applicant${selectedCount === 1 ? "" : "s"}?`}
              notePlaceholder="Add a shared note (optional)"
              pendingLabel="Rejecting…"
              onConfirm={(note) => onBulkUpdate("REJECTED", note)}
            >
              {({ onClick }) => (
                <button
                  className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11.5px] font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:shadow-focus focus-visible:outline-none"
                  type="button"
                  onClick={onClick}
                >
                  <X size={12} /> Reject selected
                </button>
              )}
            </ConfirmAction>
          </div>
        </div>
      ) : (
        <span className="text-[12px] text-neutral-400">
          Select to update in bulk
        </span>
      )}
    </div>
  );
};
