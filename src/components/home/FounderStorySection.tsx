import { Eyebrow } from "@/components/ui/eyebrow";

const FOUNDER_STATS = [
  { k: "Years remote", v: "7" },
  { k: "Upwork hours", v: "10,400+" },
  { k: "Upwork rank", v: "Top Plus" },
  { k: "Based in", v: "Đà Nẵng, VN" },
  { k: "Worked with", v: "SG · AU · US" },
];

export const FounderStorySection = () => (
  <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <Eyebrow className="mb-3">The story</Eyebrow>
      <h2 className="mb-10 text-[32px] font-semibold tracking-tight text-neutral-900">
        Built by someone who&apos;s{" "}
        <em className="font-serif-italic text-brand-700">actually done it.</em>
      </h2>
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        {/* Aside */}
        <div>
          <div className="mb-4 h-48 w-48 rounded-24 bg-gradient-to-br from-brand-200 to-brand-600" />
          <div className="space-y-2">
            {FOUNDER_STATS.map((s) => (
              <div
                className="flex items-center justify-between rounded-8 bg-neutral-50 px-3 py-2 text-[13px]"
                key={s.k}
              >
                <span className="text-neutral-500">{s.k}</span>
                <span className="font-semibold text-neutral-900">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Prose */}
        <div className="flex flex-col justify-center">
          <blockquote className="mb-5 border-l-2 border-brand-600 pl-5">
            <p className="text-[17px] italic leading-relaxed text-neutral-700">
              &ldquo;I&apos;ve worked remotely for companies in Singapore, Australia, and the US for
              seven years.{" "}
              <strong className="not-italic text-neutral-900">
                Top Plus on Upwork. Over 10,000 hours billed.
              </strong>{" "}
              Every year, dozens of people ask me the same question: how did you find it?&rdquo;
            </p>
          </blockquote>
          <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
            I couldn&apos;t answer that question for each person individually. So I built the answer
            instead.
          </p>
          <p className="mb-4 text-[15px] leading-relaxed text-neutral-600">
            Every job here gets reviewed by me before going live. Salary ranges are required. I
            check the company is real, the team is hiring, and the comp is fair for VN talent. If
            it&apos;s not, it doesn&apos;t go up.
          </p>
          <div className="mt-2">
            <div className="text-[15px] font-semibold text-neutral-900">— Trần Minh</div>
            <div className="text-[13px] text-neutral-400">
              Founder · Đà Nẵng, Vietnam · Building since Mar 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
