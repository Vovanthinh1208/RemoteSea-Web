import { Briefcase, MapPin } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

const MEMBERS = [
  {
    name: "Linh Nguyen",
    role: "Sr. Frontend Engineer",
    company: "Canva",
    city: "Đà Nẵng",
    years: 7,
    initial: "L",
    color: "linear-gradient(135deg,#2E9B52,#1F7A3D)",
    quote:
      "After two years, I finally figured out how to do deep work in PJs without losing my mind.",
  },
  {
    name: "Minh Trần",
    role: "Product Designer",
    company: "Linear",
    city: "TP. Hồ Chí Minh",
    years: 5,
    initial: "M",
    color: "linear-gradient(135deg,#F59E0B,#B45309)",
    quote:
      "The async culture here means my best work happens between 5–11pm. The team in SF doesn't blink.",
  },
  {
    name: "Hà Phạm",
    role: "Staff Engineer",
    company: "Cedar Co",
    city: "Hà Nội",
    years: 9,
    initial: "H",
    color: "linear-gradient(135deg,#2563EB,#1D4ED8)",
    quote: "Six timezones, zero standups. The PRs and docs do all the talking.",
  },
  {
    name: "Khang Lê",
    role: "Growth Marketer",
    company: "Carousell",
    city: "Đà Lạt",
    years: 4,
    initial: "K",
    color: "linear-gradient(135deg,#7C3AED,#5B21B6)",
    quote: "Living in a tea farm town. Working on growth across 5 SEA markets. Wild, honestly.",
  },
];

export const MembersSection = () => (
  <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="mb-10 text-center">
        <Eyebrow className="mb-2">Members</Eyebrow>
        <h2 className="mb-3 text-[32px] font-semibold text-neutral-900">
          The people{" "}
          <em className="font-serif text-brand-700" style={{ fontFamily: "var(--font-serif)" }}>
            actually
          </em>{" "}
          in here.
        </h2>
        <p className="mx-auto max-w-lg text-neutral-500">
          A small slice of who you&apos;ll meet. Everyone&apos;s vetted, everyone&apos;s remote,
          everyone&apos;s working for a company outside Vietnam.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MEMBERS.map((m) => (
          <article
            className="rounded-16 border border-neutral-100 bg-white p-5 shadow-card"
            key={m.name}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full text-base font-semibold text-white"
                style={{ background: m.color }}
              >
                {m.initial}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-neutral-900">{m.name}</div>
                <div className="text-[12px] text-neutral-500">{m.role}</div>
                <div className="text-[12px] text-neutral-400">@ {m.company}</div>
              </div>
            </div>
            <p className="mb-4 text-[13px] italic leading-relaxed text-neutral-600">
              &ldquo;{m.quote}&rdquo;
            </p>
            <div className="flex flex-wrap gap-3 text-[12px] text-neutral-400">
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {m.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={11} /> {m.years} years remote
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
