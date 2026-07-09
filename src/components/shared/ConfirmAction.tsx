import { useState } from "react";

interface ConfirmActionProps {
  message: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  confirmLabel?: string;
  pendingLabel?: string;
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
  children,
}: ConfirmActionProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return <>{children({ onClick: () => setIsConfirming(true) })}</>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-neutral-600">{message}</span>
      <button
        className="rounded-8 bg-red-600 px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        disabled={isPending}
        type="button"
        onClick={async () => {
          await onConfirm();
          setIsConfirming(false);
        }}
      >
        {isPending ? pendingLabel : confirmLabel}
      </button>
      <button
        className="rounded-8 border border-neutral-200 px-2.5 py-1 text-[12px] text-neutral-600 hover:bg-neutral-50"
        type="button"
        onClick={() => setIsConfirming(false)}
      >
        Cancel
      </button>
    </div>
  );
};
