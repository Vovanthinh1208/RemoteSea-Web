import * as React from "react";
import { cn } from "@/utils/cn";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  /** Backward-compatible alias for checked */
  on?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Backward-compatible alias for onCheckedChange */
  onChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      on,
      onCheckedChange,
      onChange,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const isChecked = checked ?? on ?? false;

    const handleClick = () => {
      if (disabled) return;
      const next = !isChecked;
      onCheckedChange?.(next);
      onChange?.(next);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
          "focus-visible:shadow-focus focus-visible:outline-none",
          disabled
            ? "cursor-not-allowed border-neutral-200 bg-neutral-100 opacity-60"
            : cn(
                "cursor-pointer",
                isChecked
                  ? "border-brand-600 bg-brand-600"
                  : "border-neutral-300 bg-neutral-100"
              ),
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200",
            isChecked && "-translate-y-1/2 translate-x-5"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

/** Backward-compatible alias for existing Switch call sites */
export const Toggle = Switch;
