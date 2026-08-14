import { cn } from "@/utils/cn";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Spinner } from "@/components/ui/spinner";
import { countryFlag } from "@/utils/color";
import { useSalaryBenchmarksByCountry } from "@/features/salary/salary.queries";

const ACCENT_COLORS = [
  "text-brand-700",
  "text-blue-600",
  "text-amber-600",
  "text-neutral-600",
];

const fmtK = (n: number) => `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;

export const CountrySection = () => {
  const { data, isLoading, isError } = useSalaryBenchmarksByCountry();

  return (
    <section className="border-y border-neutral-100 bg-white py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-10 text-center">
          <Eyebrow className="mb-2">By country</Eyebrow>
          <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900">
            Where the{" "}
            <em className="font-serif-italic text-brand-700">money</em> lives
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-500">
            Average compensation for open remote roles, by where the company is
            headquartered.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError || !data || data.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-400">
            Country data isn&apos;t available right now.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((c, i) => (
              <div
                className="rounded-20 border border-neutral-100 bg-white p-6 text-center transition-shadow hover:shadow-card"
                key={c.country}
              >
                <div className="mb-2 text-[36px] leading-none">
                  {countryFlag(c.country)}
                </div>
                <p className="mb-3 text-[13.5px] font-medium text-neutral-700">
                  {c.country}
                </p>
                <p
                  className={cn(
                    "mb-1 text-[32px] font-semibold leading-none tracking-tight",
                    ACCENT_COLORS[i % ACCENT_COLORS.length]
                  )}
                >
                  ${c.mid.toLocaleString()}
                  <span className="ml-0.5 text-[14px] font-normal text-neutral-400">
                    /mo
                  </span>
                </p>
                <p className="mb-3 text-[12px] text-neutral-400">
                  Range ${fmtK(c.min)}–${fmtK(c.max)}
                </p>
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11.5px] font-medium text-neutral-500">
                  {c.count} open listing{c.count === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
