import { useEffect, useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Native <dialog> opened with showModal(): the browser supplies the focus trap,
// Esc-to-close and the inert backdrop, so no hand-rolled a11y plumbing.
export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-describedby="confirm-dialog-desc"
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[min(24rem,calc(100%-2rem))] rounded-16 border border-neutral-200 bg-white p-6 shadow-card backdrop:bg-neutral-900/40"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2
        className="text-[17px] font-semibold text-neutral-900"
        id="confirm-dialog-title"
      >
        {title}
      </h2>
      <p className="mt-2 text-[14px] text-neutral-600" id="confirm-dialog-desc">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          className={cn(buttonVariants({ variant: "soft", size: "md" }))}
          type="button"
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button
          className={cn(buttonVariants({ variant: "primary", size: "md" }))}
          type="button"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
};
