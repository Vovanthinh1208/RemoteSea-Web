import { cn } from "@/utils/cn";

interface ToggleProps {
  on: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle = ({ on, onChange }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={() => onChange(!on)}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200",
      "focus-visible:ring-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      on ? "border-brand-600 bg-brand-600" : "border-neutral-300 bg-neutral-100"
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
