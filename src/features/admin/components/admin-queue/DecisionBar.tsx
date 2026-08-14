import { Ban, Check, RefreshCw } from "lucide-react";
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
        className="h-20 w-full resize-none rounded-10 border border-neutral-200 bg-white p-3 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-600 disabled:bg-neutral-50 disabled:text-neutral-400"
        disabled={!!resolution}
        placeholder="Add a note for the employer (required for change requests & rejections)…"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
      />
      {resolution ? (
        <button className="inline-flex h-9 items-center gap-1.5 rounded-10 border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-500">
          <Check size={14} />
          {RESOLVED_LABEL[resolution]}
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            className={`inline-flex h-9 items-center gap-1.5 rounded-10 px-4 text-sm font-medium transition-colors ${canApprove ? "bg-brand-600 text-white hover:bg-brand-700" : "cursor-not-allowed bg-neutral-100 text-neutral-400"}`}
            disabled={!canApprove || isPending}
            onClick={() => canApprove && onApprove()}
          >
            <Check size={14} /> Approve &amp; publish
          </button>
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-10 border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-60"
            disabled={isPending || !hasNote}
            title={
              hasNote ? undefined : "Add a note explaining what needs to change"
            }
            onClick={onRequestChanges}
          >
            <RefreshCw size={14} /> Request changes
          </button>
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-10 border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
            disabled={isPending || !hasNote}
            title={hasNote ? undefined : "Add a note explaining the rejection"}
            onClick={onReject}
          >
            <Ban size={14} /> Reject
          </button>
        </div>
      )}
    </div>
  );
};
