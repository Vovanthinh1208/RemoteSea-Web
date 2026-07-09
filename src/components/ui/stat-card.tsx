import { cn } from "@/utils/cn";

// Three sizes cover every KPI/stat tile in the app (employer dashboard, talent
// dashboard, admin queue/revenue/employers) — previously each was its own
// hand-rolled component with only cosmetic differences.
type StatCardSize = "lg" | "md" | "sm";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  size?: StatCardSize;
  warn?: boolean;
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  size = "sm",
  warn,
  className,
}: StatCardProps) => {
  if (size === "lg") {
    return (
      <div className={cn("rounded-20 border border-neutral-100 bg-white p-5", className)}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400">
            {label}
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-8 bg-neutral-100">
            <Icon className="text-neutral-500" size={14} />
          </span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-[30px] font-semibold leading-none tracking-tight text-neutral-900">
            {value}
          </span>
        </div>
        {sub && <p className="mt-1 text-[12px] text-neutral-400">{sub}</p>}
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className={cn("rounded-16 border border-neutral-100 bg-white p-5", className)}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            {label}
          </span>
          <Icon className="text-neutral-300" size={13} />
        </div>
        <div className="mb-1 text-[28px] font-semibold tracking-tight text-neutral-900">
          {value}
        </div>
        {sub && <span className="text-[12px] text-neutral-400">{sub}</span>}
      </div>
    );
  }

  return (
    <div className={cn("rounded-12 border border-neutral-100 bg-white p-4", className)}>
      <div className="mb-2 flex items-center gap-1.5 text-[12px] text-neutral-400">
        <Icon size={14} />
        {label}
      </div>
      <div
        className={cn("text-[22px] font-semibold", warn ? "text-amber-600" : "text-neutral-900")}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-neutral-400">{sub}</div>}
    </div>
  );
};
