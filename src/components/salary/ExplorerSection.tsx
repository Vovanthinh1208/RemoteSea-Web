import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PillToggle } from "@/components/shared/PillToggle";
import { Spinner } from "@/components/ui/spinner";
import { useSalaryBenchmarksBySeniority } from "@/features/salary/salary.queries";
import { LEVEL_LABELS } from "@/utils/labels";
import type { ExperienceLevel } from "@/types/job";

// Canonical ordering — the API returns levels in count-desc order, which
// isn't a sensible reading order for a seniority ladder.
const LEVEL_ORDER: ExperienceLevel[] = [
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
];

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Thin local preset over the shared PillToggle (the one chip that wasn't using
// it) — also gains PillToggle's aria-pressed, which the hand-rolled button lacked.
const Chip = ({ active, onClick, children }: ChipProps) => (
  <PillToggle
    active={active}
    activeClassName="border-brand-600 bg-brand-50 text-brand-700"
    className="rounded-8 border px-3 py-1.5 text-[12.5px] font-medium transition-all"
    inactiveClassName="border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
    onClick={onClick}
  >
    {children}
  </PillToggle>
);

interface Row {
  role: string;
  level: string;
  min: number;
  mid: number;
  max: number;
  count: number;
}

interface SalaryBarProps {
  row: Row;
  globalMax: number;
  fmt: (n: number) => string;
}

// Simplified from the original mocked chart: the real API only gives us
// min/mid/max per (role, level) — no p25/p75, so there's no IQR band to
// draw, just a single min–max span with a mid marker.
const SalaryBar = ({ row, globalMax, fmt }: SalaryBarProps) => {
  const pct = (v: number) => `${(v / globalMax) * 100}%`;
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-50 py-5 last:border-none sm:flex-row sm:items-center">
      <div className="w-44 flex-shrink-0">
        <p className="text-[13.5px] font-medium text-neutral-900">
          {LEVEL_LABELS[row.level as ExperienceLevel] ?? row.level} {row.role}
        </p>
        <p className="text-[11.5px] text-neutral-400">
          n = {row.count} listing{row.count === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex-1">
        <div className="relative mb-2 h-2 w-full rounded-full bg-neutral-100">
          {/* Min–max span */}
          <span
            className="absolute h-full rounded-full bg-brand-200"
            style={{
              left: pct(row.min),
              width: `${((row.max - row.min) / globalMax) * 100}%`,
            }}
          />
          {/* Mid */}
          <span
            className="absolute -top-1 h-4 w-0.5 rounded-full bg-brand-600"
            style={{ left: pct(row.mid) }}
            title={`Average midpoint ${fmt(row.mid)}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">{fmt(row.min)}</span>
          <span className="font-medium text-neutral-700">
            avg{" "}
            <strong className="font-semibold text-neutral-900">
              {fmt(row.mid)}
            </strong>
          </span>
          <span className="text-neutral-400">{fmt(row.max)}</span>
        </div>
      </div>
    </div>
  );
};

export const ExplorerSection = () => {
  const { data, isLoading, isError } = useSalaryBenchmarksBySeniority();
  const [role, setRole] = useState<string | null>(null);
  const [seniority, setSeniority] = useState("All");
  const [currency, setCurrency] = useState<"USD" | "VND">("USD");

  const roles = useMemo(() => {
    if (!data) return [];
    const totals = new Map<string, number>();
    data.forEach((r) =>
      totals.set(r.role, (totals.get(r.role) ?? 0) + r.count)
    );
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
  }, [data]);

  const activeRole = role ?? roles[0] ?? null;

  const rowsForRole = useMemo(
    () => (data && activeRole ? data.filter((r) => r.role === activeRole) : []),
    [data, activeRole]
  );

  const levels = useMemo(
    () =>
      LEVEL_ORDER.filter((level) => rowsForRole.some((r) => r.level === level)),
    [rowsForRole]
  );

  const rows = useMemo(
    () =>
      seniority === "All"
        ? rowsForRole
        : rowsForRole.filter(
            (r) => LEVEL_LABELS[r.level as ExperienceLevel] === seniority
          ),
    [rowsForRole, seniority]
  );

  const globalMax = Math.max(1, ...(data ?? []).map((r) => r.max));
  const fmt = (n: number) =>
    currency === "VND"
      ? `${((n * 25.5) / 1000).toFixed(0)}M₫`
      : `$${n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n}`;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow className="mb-2">Explorer</Eyebrow>
            <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900">
              Salary by{" "}
              <em className="font-serif-italic text-brand-700">
                role &amp; seniority
              </em>
            </h2>
          </div>
          <div className="flex items-center gap-0.5 rounded-8 border border-neutral-200 bg-white p-0.5">
            {(["USD", "VND"] as const).map((c) => (
              <button
                className={cn(
                  "rounded-6 px-3 py-1.5 text-[12px] font-medium transition-all focus-visible:shadow-focus focus-visible:outline-none",
                  currency === c
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-20 border border-neutral-100 bg-white py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError || roles.length === 0 ? (
          <div className="rounded-20 border border-neutral-100 bg-white py-16 text-center text-sm text-neutral-400">
            Salary data isn&apos;t available right now.
          </div>
        ) : (
          <>
            {/* Role chips */}
            <div className="mb-4">
              <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-neutral-400">
                Role
              </p>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <Chip
                    active={activeRole === r}
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setSeniority("All");
                    }}
                  >
                    {r}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Seniority chips */}
            <div className="mb-8">
              <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-neutral-400">
                Seniority
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip
                  active={seniority === "All"}
                  onClick={() => setSeniority("All")}
                >
                  All
                </Chip>
                {levels.map((level) => (
                  <Chip
                    active={seniority === LEVEL_LABELS[level]}
                    key={level}
                    onClick={() => setSeniority(LEVEL_LABELS[level])}
                  >
                    {LEVEL_LABELS[level]}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Chart card */}
            <div className="rounded-20 border border-neutral-100 bg-white p-6 shadow-card">
              {/* Legend */}
              <div className="mb-5 flex flex-wrap items-center gap-5 border-b border-neutral-50 pb-4">
                <div className="flex items-center gap-2 text-[11.5px] text-neutral-400">
                  <span className="h-2 w-8 rounded-full bg-brand-200" />
                  Min – max range
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-neutral-400">
                  <span className="h-3.5 w-0.5 rounded-full bg-brand-600" />
                  Average
                </div>
              </div>

              {rows.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-400">
                  No data yet for <strong>{activeRole}</strong> at{" "}
                  <strong>{seniority}</strong>. Try another seniority.
                </div>
              ) : (
                <div>
                  {rows.map((row) => (
                    <SalaryBar
                      fmt={fmt}
                      globalMax={globalMax}
                      key={row.role + row.level}
                      row={row}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-5 flex items-start gap-2 rounded-12 bg-neutral-50 px-4 py-3 text-[12.5px] text-neutral-500">
          <Zap className="mt-0.5 flex-shrink-0 text-amber-500" size={14} />
          Figures are averaged from active job listings' posted salary ranges,
          in USD unless toggled. Bonuses &amp; equity excluded.
        </div>
      </div>
    </section>
  );
};
