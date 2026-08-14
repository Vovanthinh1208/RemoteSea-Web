import { Eyebrow } from "@/components/ui/eyebrow";

const TESTIMONIALS = [
  {
    quote:
      "I tried Upwork for two years but the competition was brutal. Through this platform I applied to a Singapore startup that fit my timezone and got an offer at $2,800/month within three weeks.",
    name: "Phạm Tuấn",
    title: "Frontend Developer · Hired by Finch Labs (SG)",
    meta: "$2,800/mo · 3 weeks",
    initials: "PT",
    color: "#2E9B52",
  },
  {
    quote:
      "The salary benchmark was a game-changer. I'd been undercharging by 40%. Renegotiated my current contract using the data here and got bumped up before even applying anywhere.",
    name: "Nguyễn Anh",
    title: "Product Designer · Brackish (SG)",
    meta: "$3,400/mo · current",
    initials: "NA",
    color: "#0EA5E9",
  },
  {
    quote:
      "First place I've seen that actually tells you which companies have VN people already. That signal alone saved me weeks of 'do they hire remote? do they hire Vietnamese?' guesswork.",
    name: "Lê Hoàng",
    title: "Backend Engineer · Sea Group (SG)",
    meta: "$3,200/mo · 5 weeks",
    initials: "LH",
    color: "#EE4D2D",
  },
];

export const TestimonialsSection = () => (
  <section className="border-y border-neutral-100 bg-white py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="mb-10 text-center">
        <Eyebrow className="mb-3">Talent stories</Eyebrow>
        <h2 className="text-[32px] font-semibold text-neutral-900">
          From{" "}
          <em
            className="font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            apply
          </em>{" "}
          to{" "}
          <em
            className="font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            offer
          </em>
          .
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div
            className="rounded-16 border border-neutral-100 bg-neutral-50 p-6"
            key={t.name}
          >
            <p className="mb-5 text-[14px] italic leading-relaxed text-neutral-700">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: t.color }}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-neutral-900">
                  {t.name}
                </div>
                <div className="text-[12px] text-neutral-400">{t.title}</div>
                <div className="mt-0.5 font-mono text-[11px] text-amber-700">
                  {t.meta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
