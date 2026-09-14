import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckRowProps {
  checked: boolean;
  label: string;
  /** Result-count badge (e.g. the jobs board's facet counts) — omit where
   *  the filter has no per-option count to show, as on the talent search
   *  sidebar. */
  count?: number;
  onToggle: () => void;
}

// Single source of truth for a filter-sidebar checkbox row — was defined
// almost identically in both FilterSidebar.tsx (jobs board) and
// TalentFilterSidebar.tsx (employer talent search), differing only in
// whether a result count was shown. A <label> wrapping a real (visually
// hidden) checkbox input, not a styled <span>, is what keeps this in the
// tab order and responsive to Enter/Space.
export const CheckRow = ({
  checked,
  label,
  count,
  onToggle,
}: CheckRowProps) => (
  <label
    className={cn(
      "flex cursor-pointer select-none items-center gap-2.5 py-1.5 text-[13.5px] transition-colors",
      checked ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
    )}
  >
    <input
      checked={checked}
      className="peer sr-only"
      type="checkbox"
      onChange={onToggle}
    />
    <span
      aria-hidden="true"
      className={cn(
        "grid h-4 w-4 flex-shrink-0 place-items-center rounded-4 border transition-all",
        "peer-focus-visible:shadow-focus",
        checked
          ? "border-brand-600 bg-brand-600"
          : "border-neutral-300 bg-white"
      )}
    >
      {checked && <Check className="text-white" size={10} strokeWidth={3} />}
    </span>
    <span className="flex-1">{label}</span>
    {count !== undefined && (
      <span className="text-[11px] tabular-nums text-neutral-400">{count}</span>
    )}
  </label>
);
