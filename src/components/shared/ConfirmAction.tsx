import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";

interface ConfirmActionProps {
  message: string;
  onConfirm: (note?: string) => void | Promise<void>;
  isPending?: boolean;
  confirmLabel?: string;
  pendingLabel?: string;
  /** Adds an optional note textarea to the confirm step, passed to onConfirm
   *  trimmed (undefined if left blank) — opt-in so every other call site
   *  (account deletion, alert deletion, ...) keeps its current compact form. */
  notePlaceholder?: string;
  /** Renders the idle-state trigger (e.g. an icon button or a labeled button). */
  children: (props: { onClick: () => void }) => React.ReactNode;
}

/**
 * A destructive action that requires an explicit second click before it fires —
 * reused wherever a click currently does something irreversible immediately
 * (deleting an alert, suspending an employer), matching the confirm/cancel
 * pattern already used for account deletion instead of each call site
 * re-implementing its own.
 */
export const ConfirmAction = ({
  message,
  onConfirm,
  isPending,
  confirmLabel = "Yes",
  pendingLabel = "Working…",
  notePlaceholder,
  children,
}: ConfirmActionProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [note, setNote] = useState("");

  if (!isConfirming) {
    return <>{children({ onClick: () => setIsConfirming(true) })}</>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-neutral-600">{message}</span>
        <Button
          disabled={isPending}
          isLoading={isPending}
          size="sm"
          type="button"
          variant="danger"
          onClick={async () => {
            await onConfirm(note.trim() || undefined);
            setIsConfirming(false);
            setNote("");
          }}
        >
          {isPending ? pendingLabel : confirmLabel}
        </Button>
        <Button
          className="border-neutral-200 hover:bg-neutral-50"
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => {
            setIsConfirming(false);
            setNote("");
          }}
        >
          Cancel
        </Button>
      </div>
      {notePlaceholder !== undefined && (
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          placeholder={notePlaceholder}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      )}
    </div>
  );
};
