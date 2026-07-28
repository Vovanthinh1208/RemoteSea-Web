import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PillToggle } from "@/components/shared/PillToggle";

const SALARY_DATA = [
  {
    role: "Software Engineer",
    seniority: "Junior",
    min: 900,
    p25: 1200,
    median: 1500,
    p75: 1900,
    max: 2400,
    samples: 84,
  },
  {
    role: "Software Engineer",
    seniority: "Mid",
    min: 1800,
    p25: 2400,
    median: 3000,
    p75: 3700,
    max: 4500,
    samples: 142,
  },
  {
    role: "Software Engineer",
    seniority: "Senior",
    min: 3200,
    p25: 4000,
    median: 4800,
    p75: 5800,
    max: 7200,
    samples: 96,
  },
  {
    role: "Software Engineer",
    seniority: "Staff",
    min: 5500,
    p25: 6500,
    median: 7800,
    p75: 9200,
    max: 11500,
    samples: 28,
  },
  {
    role: "Product Designer",
    seniority: "Mid",
    min: 1400,
    p25: 1900,
    median: 2400,
    p75: 3100,
    max: 3800,
    samples: 51,
  },
  {
    role: "Product Designer",
    seniority: "Senior",
    min: 2800,
    p25: 3400,
    median: 4100,
    p75: 5000,
    max: 6400,
    samples: 36,
  },
  {
    role: "Product Manager",
    seniority: "Mid",
    min: 1800,
    p25: 2400,
    median: 3000,
    p75: 3700,
    max: 4500,
    samples: 41,
  },
  {
    role: "Product Manager",
    seniority: "Senior",
    min: 3400,
    p25: 4200,
    median: 5000,
    p75: 6100,
    max: 7500,
    samples: 27,
  },
  {
    role: "Data Analyst",
    seniority: "Mid",
    min: 1300,
    p25: 1800,
    median: 2300,
    p75: 2900,
    max: 3600,
    samples: 38,
  },
  {
    role: "Data Engineer",
    seniority: "Senior",
    min: 3000,
    p25: 3800,
    median: 4600,
    p75: 5600,
    max: 6800,
    samples: 22,
  },
  {
    role: "Marketing Manager",
    seniority: "Mid",
    min: 1100,
    p25: 1500,
    median: 1900,
    p75: 2400,
    max: 3000,
    samples: 47,
  },
  {
    role: "Customer Success",
    seniority: "Mid",
    min: 900,
    p25: 1300,
    median: 1700,
    p75: 2100,
    max: 2700,
    samples: 32,
  },
  {
    role: "DevOps / Platform",
    seniority: "Senior",
    min: 3500,
    p25: 4200,
    median: 5100,
    p75: 6200,
    max: 7600,
    samples: 24,
  },
];

const ROLES = [
  "Software Engineer",
  "Product Designer",
  "Product Manager",
  "Data Analyst",
  "Data Engineer",
  "Marketing Manager",
  "Customer Success",
  "DevOps / Platform",
];
const SENIORITIES = ["All", "Junior", "Mid", "Senior", "Staff"];

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

interface SalaryBarProps {
  row: (typeof SALARY_DATA)[0];
  globalMax: number;
  fmt: (n: number) => string;
}

const SalaryBar = ({ row, globalMax, fmt }: SalaryBarProps) => {
  const pct = (v: number) => `${(v / globalMax) * 100}%`;
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-50 py-5 last:border-none sm:flex-row sm:items-center">
      <div className="w-44 flex-shrink-0">
        <p className="text-[13.5px] font-medium text-neutral-900">
          {row.seniority} {row.role}
        </p>
        <p className="text-[11.5px] text-neutral-400">n = {row.samples} offers</p>
      </div>
      <div className="flex-1">
        <div className="relative mb-2 h-2 w-full rounded-full bg-neutral-100">
          {/* IQR band */}
          <span
            className="absolute h-full rounded-full bg-brand-200"
            style={{ left: pct(row.p25), width: `${((row.p75 - row.p25) / globalMax) * 100}%` }}
          />
          {/* Median */}
          <span
            className="absolute -top-1 h-4 w-0.5 rounded-full bg-brand-600"
            style={{ left: pct(row.median) }}
            title={`Median ${fmt(row.median)}`}
          />
          {/* Min */}
          <span
            className="absolute top-0 h-2 w-1 -translate-x-1/2 rounded-4 bg-neutral-300"
            style={{ left: pct(row.min) }}
            title={`Min ${fmt(row.min)}`}
          />
          {/* Max */}
          <span
            className="absolute top-0 h-2 w-1 -translate-x-1/2 rounded-4 bg-neutral-400"
            style={{ left: pct(row.max) }}
            title={`Max ${fmt(row.max)}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">{fmt(row.min)}</span>
          <span className="font-medium text-neutral-700">
            median <strong className="font-semibold text-neutral-900">{fmt(row.median)}</strong>
          </span>
          <span className="text-neutral-400">{fmt(row.max)}</span>
        </div>
      </div>
    </div>
  );
};

export const ExplorerSection = () => {
  const [role, setRole] = useState("Software Engineer");
  const [seniority, setSeniority] = useState("All");
  const [currency, setCurrency] = useState<"USD" | "VND">("USD");

  const globalMax = Math.max(...SALARY_DATA.map((r) => r.max));
  const fmt = (n: number) =>
    currency === "VND"
      ? `${((n * 25.5) / 1000).toFixed(0)}M₫`
      : `$${n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n}`;

  const rows = useMemo(
    () =>
      SALARY_DATA.filter(
        (r) => r.role === role && (seniority === "All" || r.seniority === seniority)
      ),
    [role, seniority]
  );

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow className="mb-2">Explorer</Eyebrow>
            <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900">
              Salary by <em className="font-serif-italic text-brand-700">role &amp; seniority</em>
            </h2>
          </div>
          <div className="flex items-center gap-0.5 rounded-8 border border-neutral-200 bg-white p-0.5">
            {(["USD", "VND"] as const).map((c) => (
              <button
                className={cn(
                  "rounded-6 px-3 py-1.5 text-[12px] font-medium transition-all",
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

        {/* Role chips */}
        <div className="mb-4">
          <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-neutral-400">
            Role
          </p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Chip active={role === r} key={r} onClick={() => setRole(r)}>
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
            {SENIORITIES.map((s) => (
              <Chip active={seniority === s} key={s} onClick={() => setSeniority(s)}>
                {s}
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
              25th – 75th percentile
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-neutral-400">
              <span className="h-3.5 w-0.5 rounded-full bg-brand-600" />
              Median
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-neutral-400">
              <span className="h-2 w-1 rounded-4 bg-neutral-400" />
              Min / max
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-neutral-400">
              No data yet for <strong>{role}</strong> at <strong>{seniority}</strong>. Try another
              seniority.
            </div>
          ) : (
            <div>
              {rows.map((row) => (
                <SalaryBar
                  fmt={fmt}
                  globalMax={globalMax}
                  key={row.role + row.seniority}
                  row={row}
                />
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-5 flex items-start gap-2 rounded-12 bg-neutral-50 px-4 py-3 text-[12.5px] text-neutral-500">
          <Zap className="mt-0.5 flex-shrink-0 text-amber-500" size={14} />
          All figures are gross monthly salary in USD unless toggled. Bonuses &amp; equity excluded.
          Submit your offer anonymously to help refine these numbers.
        </div>
      </div>
    </section>
  );
};
