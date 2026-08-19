import { cn } from "@/utils/cn";

interface ToggleProps {
  on: boolean;
  onChange: (value: boolean) => void;
  /** For a preference that doesn't do anything yet (see NotificationsSection's
   *  browserPush row) — renders inert instead of letting the user set an
   *  expectation nothing behind it can meet. */
  disabled?: boolean;
}

export const Toggle = ({ on, onChange, disabled }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-disabled={disabled}
    disabled={disabled}
    onClick={() => onChange(!on)}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
      "focus-visible:shadow-focus focus-visible:outline-none",
      disabled
        ? "cursor-not-allowed border-neutral-200 bg-neutral-100 opacity-60"
        : cn(
            "cursor-pointer",
            on
              ? "border-brand-600 bg-brand-600"
              : "border-neutral-300 bg-neutral-100"
          )
    )}
  >
    <span
      className={cn(
        "absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200",
        on && "-translate-y-1/2 translate-x-5"
      )}
    />
  </button>
);
