import { cn } from "@/utils/cn";
import { Eyebrow } from "@/components/ui/eyebrow";

const COUNTRY_BANDS = [
  {
    country: "Singapore",
    flag: "🇸🇬",
    median: 3800,
    range: "2.4k–6.2k",
    jobs: 18,
    color: "text-brand-700",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    median: 4200,
    range: "2.8k–7.5k",
    jobs: 14,
    color: "text-blue-600",
  },
  {
    country: "United States (remote-first)",
    flag: "🇺🇸",
    median: 5600,
    range: "3.5k–9k",
    jobs: 11,
    color: "text-amber-600",
  },
  {
    country: "Europe (remote-first)",
    flag: "🇪🇺",
    median: 3400,
    range: "2.2k–5.4k",
    jobs: 4,
    color: "text-neutral-600",
  },
];

export const CountrySection = () => {
  return (
    <section className="border-y border-neutral-100 bg-white py-16">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-10 text-center">
          <Eyebrow className="mb-2">By country</Eyebrow>
          <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900">
            Where the <em className="font-serif-italic text-brand-700">money</em> lives
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-500">
            Median compensation for mid-level remote roles, by where the company is headquartered.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COUNTRY_BANDS.map((c) => (
            <div
              className="rounded-20 border border-neutral-100 bg-white p-6 text-center transition-shadow hover:shadow-card"
              key={c.country}
            >
              <div className="mb-2 text-[36px] leading-none">{c.flag}</div>
              <p className="mb-3 text-[13.5px] font-medium text-neutral-700">{c.country}</p>
              <p
                className={cn(
                  "mb-1 text-[32px] font-semibold leading-none tracking-tight",
                  c.color
                )}
              >
                ${c.median.toLocaleString()}
                <span className="ml-0.5 text-[14px] font-normal text-neutral-400">/mo</span>
              </p>
              <p className="mb-3 text-[12px] text-neutral-400">Range {c.range}</p>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11.5px] font-medium text-neutral-500">
                {c.jobs} open this month
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
