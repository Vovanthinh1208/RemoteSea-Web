import { Ban, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { cn } from "@/utils/cn";
import type { ResolutionKind } from "@/features/admin/components/admin-queue/ResolutionBanner";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation("admin");
  // The placeholder already implies notes are sent with these two decisions —
  // but the note was never actually required, so an employer could receive a
  // rejection with no reason attached. Enforce what the copy already promises.
  const hasNote = note.trim().length > 0;

  return (
    <div className="space-y-3 border-t border-neutral-100 pt-4">
      <textarea
        aria-label={t("decision.noteAria")}
        className={cn(TEXTAREA_INPUT_CLASS, "h-20")}
        disabled={!!resolution}
        placeholder={t("decision.notePlaceholder")}
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
      />
      {resolution ? (
        // Static status readout, not a control — was a bare <button> with no
        // onClick, which put a dead, focusable element in the tab order.
        <div className="inline-flex h-[38px] items-center gap-1.5 rounded-8 border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-500">
          <Check size={14} />
          {t(`decision.resolved.${resolution}`)}
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
            <Check size={14} /> {t("decision.approve")}
          </Button>
          <button
            className="inline-flex h-[38px] items-center gap-1.5 rounded-8 border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !hasNote}
            title={hasNote ? undefined : t("decision.changesHint")}
            type="button"
            onClick={onRequestChanges}
          >
            <RefreshCw size={14} /> {t("decision.changes")}
          </button>
          <Button
            disabled={isPending || !hasNote}
            title={hasNote ? undefined : t("decision.rejectHint")}
            type="button"
            variant="danger"
            onClick={onReject}
          >
            <Ban size={14} /> {t("decision.reject")}
          </Button>
        </div>
      )}
    </div>
  );
};
