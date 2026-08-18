import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ExplorerSection } from "@/components/salary/ExplorerSection";
import { CountrySection } from "@/components/salary/CountrySection";
import { SubmitSection } from "@/components/salary/SubmitSection";
import { useSalaryBenchmarks } from "@/features/salary/salary.queries";

// Sections live in components/salary/* (one file per section with its own
// data, same convention as components/home/* and employer-marketing/*) —
// this page was previously a single 630-line file holding all four sections
// and their datasets.

export const SalaryPage = () => {
  useDocumentTitle(
    "Remote Salary Guide — Vietnam Talent",
    "Real remote-salary data for Vietnamese professionals working for Singapore, Australia, and US companies — by role, seniority, and country."
  );

  const { data: benchmarks } = useSalaryBenchmarks();
  const totalCount = benchmarks?.reduce((sum, b) => sum + b.count, 0) ?? 0;
  const weightedMid =
    benchmarks && totalCount > 0
      ? Math.round(
          benchmarks.reduce((sum, b) => sum + b.mid * b.count, 0) / totalCount
        )
      : null;

  // Derived from the same benchmarks GET already backing ExplorerSection —
  // no separate stats endpoint. "—" while loading rather than a fabricated
  // placeholder number.
  const heroStats = [
    {
      num: benchmarks ? String(totalCount) : "—",
      label: "Active listings with salary",
    },
    {
      num: weightedMid ? `$${weightedMid.toLocaleString()}` : "—",
      label: "Average monthly salary",
    },
    {
      num: benchmarks ? String(benchmarks.length) : "—",
      label: "Roles benchmarked",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 80% 0%, rgba(46,155,82,0.08) 0%, transparent 60%), #F8F7F4",
          }}
        />
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-5 inline-flex items-center gap-2 text-[12px] font-semibold text-neutral-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
            Live from active job listings
          </div>
          <h1 className="mb-4 max-w-2xl text-[clamp(32px,4.5vw,52px)] font-semibold leading-[1.1] tracking-tight text-neutral-900">
            What should you{" "}
            <em className="font-serif-italic text-brand-700">actually</em> earn
            working remotely?
          </h1>
          <p className="mb-10 max-w-xl text-[16px] leading-relaxed text-neutral-500">
            Real numbers computed from the salary ranges companies post on live
            job listings — by role, seniority, and country.
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-5">
            {heroStats.map((s, i) => (
              <div className="flex items-center gap-4" key={s.label}>
                {i > 0 && (
                  <div className="hidden h-8 w-px bg-neutral-200 sm:block" />
                )}
                <div>
                  <p className="text-[26px] font-semibold tracking-tight text-neutral-900">
                    {s.num}
                  </p>
                  <p className="text-[12px] text-neutral-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ExplorerSection />
      <CountrySection />
      <SubmitSection />
    </>
  );
};
