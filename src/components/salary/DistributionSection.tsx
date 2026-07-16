import { Eyebrow } from "@/components/ui/eyebrow";

const HISTOGRAM_BUCKETS = [
  { range: "<1k", pct: 4 },
  { range: "1–2k", pct: 14 },
  { range: "2–3k", pct: 22 },
  { range: "3–4k", pct: 26 },
  { range: "4–5k", pct: 18 },
  { range: "5–7k", pct: 11 },
  { range: "7–10k", pct: 4 },
  { range: ">10k", pct: 1 },
];

export const DistributionSection = () => {
  const maxPct = Math.max(...HISTOGRAM_BUCKETS.map((b) => b.pct));
  return (
    <section className="bg-neutral-900 py-16">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-2">Distribution</Eyebrow>
            <h2 className="mb-3 text-[28px] font-semibold tracking-tight text-white">
              The <em className="font-serif-italic text-brand-400">shape</em> of remote pay.
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-neutral-400">
              Most VN talent working remote sits in the $2k–$5k band. The fat tail is real — but it
              lives at senior + staff levels with US-based companies.
            </p>
            <ul className="space-y-2.5">
              {[
                <>
                  <strong className="text-white">72%</strong> of placements between $2k–$5k
                </>,
                <>
                  <strong className="text-white">$3,200</strong> is the median across all roles
                </>,
                <>
                  Staff+ engineering jobs can hit <strong className="text-white">$10k+</strong>{" "}
                  monthly
                </>,
              ].map((item, i) => (
                <li className="flex items-start gap-2.5 text-[13.5px] text-neutral-400" key={i}>
                  <span className="bg-brand-500 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Histogram */}
          <div className="flex h-48 items-end gap-2">
            {HISTOGRAM_BUCKETS.map((b) => (
              <div className="flex flex-1 flex-col items-center gap-1.5" key={b.range}>
                <span className="font-mono text-[10px] text-neutral-500">{b.pct}%</span>
                <div
                  className="w-full rounded-t-4 bg-brand-600/70 transition-all"
                  style={{ height: `${(b.pct / maxPct) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-neutral-500">{b.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
