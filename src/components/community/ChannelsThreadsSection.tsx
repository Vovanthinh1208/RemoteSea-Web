import { Users } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

const CHANNELS = [
  {
    name: "introductions",
    topic: "New members say hi",
    count: 487,
    color: "#2E9B52",
  },
  {
    name: "offer-negotiations",
    topic: "Help with your counter",
    count: 142,
    color: "#B45309",
  },
  {
    name: "async-rituals",
    topic: "How teams actually work",
    count: 98,
    color: "#2563EB",
  },
  {
    name: "equity-explained",
    topic: "Stock options, RSUs, vesting",
    count: 76,
    color: "#1F7A3D",
  },
  {
    name: "parents-who-remote",
    topic: "WFH with kids around",
    count: 64,
    color: "#7C3AED",
  },
  {
    name: "coliving-da-nang",
    topic: "The unofficial HQ",
    count: 53,
    color: "#0EA5E9",
  },
];

const THREADS = [
  {
    channel: "#offer-negotiations",
    initial: "L",
    color: "linear-gradient(135deg,#2E9B52,#1F7A3D)",
    name: "Linh N.",
    time: "2h",
    text: "Just got an offer from a Series B in SG — $4.8k base, 0.08% equity at $80M valuation. Senior FE, 5 yoe. Feels low vs market? Anyone negotiated similar?",
    replies: 18,
    reactions: ["🤔", "💪", "🔥"],
  },
  {
    channel: "#async-rituals",
    initial: "M",
    color: "linear-gradient(135deg,#F59E0B,#B45309)",
    name: "Minh T.",
    time: "5h",
    text: "Anyone tried Loom for design crits in fully-async teams? My team in Sydney loves it but I find myself rewatching at 2x and missing the nuance. Tips welcome.",
    replies: 11,
    reactions: ["📹", "✨"],
  },
  {
    channel: "#coliving-da-nang",
    initial: "K",
    color: "linear-gradient(135deg,#7C3AED,#5B21B6)",
    name: "Khang L.",
    time: "1d",
    text: "Heads up — Hidden Bean in An Thượng has zero wifi today. Going to Surf Bar instead. Anyone else around for coworking 2–6pm?",
    replies: 7,
    reactions: ["☕", "🏄"],
  },
];

export const ChannelsThreadsSection = () => (
  <section className="pb-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="mb-10 text-center">
        <Eyebrow className="mb-2">Inside</Eyebrow>
        <h2 className="mb-3 text-[32px] font-semibold text-neutral-900">
          What people{" "}
          <em
            className="font-serif text-brand-700"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            actually
          </em>{" "}
          talk about.
        </h2>
        <p className="mx-auto max-w-lg text-neutral-500">
          A peek at the channels and a few threads from this week. Names
          redacted out of respect — when you join, the full archive is yours.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Channels list */}
        <div className="rounded-16 border border-neutral-100 bg-white p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Channels
          </div>
          <div className="space-y-1">
            {CHANNELS.map((ch) => (
              <div
                className="flex items-center gap-2.5 rounded-10 px-3 py-2.5 transition-colors hover:bg-neutral-50"
                key={ch.name}
              >
                <span
                  className="text-[15px] font-bold"
                  style={{ color: ch.color }}
                >
                  #
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-neutral-800">
                    {ch.name}
                  </div>
                  <div className="text-[11px] text-neutral-400">{ch.topic}</div>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] text-neutral-400">
                  {ch.count}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 text-[12px] text-neutral-400">
            + 24 more
          </div>
        </div>

        {/* Threads */}
        <div className="space-y-4">
          {THREADS.map((t, i) => (
            <article
              className="rounded-16 border border-neutral-100 bg-white p-5 shadow-card"
              key={i}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <div
                  className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: t.color }}
                >
                  {t.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-semibold text-neutral-900">
                    {t.name}
                  </span>
                  <span className="mx-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
                    {t.channel}
                  </span>
                  <span className="text-[12px] text-neutral-400">{t.time}</span>
                </div>
              </div>
              <p className="mb-3 text-[14px] leading-relaxed text-neutral-700">
                {t.text}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {t.reactions.map((r) => (
                    <span
                      className="rounded-full border border-neutral-100 bg-neutral-50 px-2 py-0.5 text-sm"
                      key={r}
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[12px] text-neutral-400">
                  <Users size={12} /> {t.replies} replies
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);
