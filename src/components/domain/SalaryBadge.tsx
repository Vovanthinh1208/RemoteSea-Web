import { cn } from "@/utils/cn";
import { formatSalaryRange } from "@/utils/format";

export interface SalaryBadgeProps {
  min: number | null;
  max: number | null;
  unit?: string;
  className?: string;
}

// Renders nothing when the job has no salary at all — callers used to paper
// over that case with `?? 0`, which showed "$0–0".
export const SalaryBadge = ({
  min,
  max,
  unit = "/mo",
  className,
}: SalaryBadgeProps) => {
  const range = formatSalaryRange(min, max);
  if (!range) return null;
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-8 bg-amber-100 px-2 py-1 font-mono text-[13px] font-semibold tracking-tight text-amber-700",
        className
      )}
    >
      {range}
      {unit}
    </span>
  );
};
