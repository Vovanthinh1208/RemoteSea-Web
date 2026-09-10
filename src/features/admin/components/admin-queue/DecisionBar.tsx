import { Ban, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { cn } from "@/utils/cn";
import type { ResolutionKind } from "@/features/admin/components/admin-queue/ResolutionBanner";

const RESOLVED_LABEL: Record<ResolutionKind, string> = {
  approved: "Approved & published",
  changes: "Changes requested",
  rejected: "Rejected",
};

interface DecisionBarProps {
  note: string;
  onNoteChange: (value: string) => void;
  resolution?: ResolutionKind;
  canApprove: boolean;
  isPending: boolean;
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
}

export const DecisionBar = ({
  note,
  onNoteChange,
  resolution,
  canApprove,
  isPending,
  onApprove,
  onRequestChanges,
  onReject,
}: DecisionBarProps) => {
  // The placeholder already implies notes are sent with these two decisions —
  // but the note was never actually required, so an employer could receive a
  // rejection with no reason attached. Enforce what the copy already promises.
  const hasNote = note.trim().length > 0;

  return (
    <div className="space-y-3 border-t border-neutral-100 pt-4">
      <textarea
        aria-label="Note for the employer"
        className={cn(TEXTAREA_INPUT_CLASS, "h-20")}
        disabled={!!resolution}
        placeholder="Add a note for the employer (required for change requests & rejections)…"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
      />
      {resolution ? (
        // Static status readout, not a control — was a bare <button> with no
        // onClick, which put a dead, focusable element in the tab order.
        <div className="inline-flex h-[38px] items-center gap-1.5 rounded-8 border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-500">
          <Check size={14} />
          {RESOLVED_LABEL[resolution]}
        </div>
      ) : (
        // Approve and Reject are the two unambiguous decisions here, so both
        // get solid primary-weight treatment (Button's primary/danger) —
        // Reject was previously a soft red-50 chip, the same visual weight as
        // "Request changes", which made the two easy to mistake for equally
        // casual options instead of one being a final, irreversible call.
        <div className="flex gap-2">
          <Button
            disabled={!canApprove || isPending}
            type="button"
            variant="primary"
            onClick={() => canApprove && onApprove()}
          >
            <Check size={14} /> Approve &amp; publish
          </Button>
          <button
            className="inline-flex h-[38px] items-center gap-1.5 rounded-8 border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !hasNote}
            title={
              hasNote ? undefined : "Add a note explaining what needs to change"
            }
            type="button"
            onClick={onRequestChanges}
          >
            <RefreshCw size={14} /> Request changes
          </button>
          <Button
            disabled={isPending || !hasNote}
            title={hasNote ? undefined : "Add a note explaining the rejection"}
            type="button"
            variant="danger"
            onClick={onReject}
          >
            <Ban size={14} /> Reject
          </Button>
        </div>
      )}
    </div>
  );
};
