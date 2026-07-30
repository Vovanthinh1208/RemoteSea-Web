import { MapPin } from "lucide-react";

const EVENTS = [
  {
    title: "Remoteo meetup · Đà Nẵng",
    desc: "Monthly coworking + dinner. Coast-facing café. Bring a laptop or just yourself.",
    date: "Apr 06",
    day: "Sat",
    attendees: 32,
    city: "Đà Nẵng",
    color: "#2E9B52",
  },
  {
    title: "Async tooling teardown",
    desc: "Three folks share their full async stack — Notion, Linear, Loom, beyond. Lightning talks.",
    date: "Apr 11",
    day: "Thu",
    attendees: 64,
    city: "Online",
    color: "#2563EB",
  },
  {
    title: "Equity & options 101",
    desc: "Workshop with a tax lawyer from Singapore. RSUs, ISOs, double-trigger acceleration — the whole deal.",
    date: "Apr 18",
    day: "Thu",
    attendees: 41,
    city: "Online",
    color: "#B45309",
  },
  {
    title: "Founders & freelancers brunch",
    desc: "Hosted at Cộng Cafe, Ngô Đức Kế. For members building their own thing on the side or full-time.",
    date: "Apr 27",
    day: "Sat",
    attendees: 22,
    city: "TP.HCM",
    color: "#1F7A3D",
  },
];

export const MeetupsSection = () => (
  <section className="bg-neutral-900 py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="mb-10 text-center">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          In person
        </p>
        <h2 className="mb-3 text-[32px] font-semibold text-white">
          Coffee, beers, &amp;{" "}
          <em
            className="font-serif text-brand-400"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            offline
          </em>{" "}
          bandwidth.
        </h2>
        <p className="mx-auto max-w-lg text-neutral-400">
          Members organize meetups whenever 5+ folks are in the same
          city. Free, low-key, and the wifi is always passable.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EVENTS.map((e, i) => (
          <article
            className="flex gap-4 rounded-16 border border-neutral-700 bg-neutral-800 p-5"
            key={i}
          >
            <div
              className="flex w-14 flex-shrink-0 flex-col items-center rounded-10 border-t-2 bg-neutral-700 pt-2"
              style={{ borderColor: e.color }}
            >
              <span className="text-[10px] font-semibold uppercase text-neutral-400">
                {e.date.split(" ")[0]}
              </span>
              <span className="text-[22px] font-semibold text-white">
                {e.date.split(" ")[1]}
              </span>
              <span className="text-[10px] text-neutral-400">
                {e.day}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1 text-[11px] text-neutral-400">
                <MapPin size={10} /> {e.city}
              </div>
              <h4 className="mb-1.5 text-[14px] font-semibold text-white">
                {e.title}
              </h4>
              <p className="mb-3 text-[12px] leading-relaxed text-neutral-400">
                {e.desc}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((j) => (
                    <span
                      className="h-5 w-5 rounded-full border border-neutral-800"
                      key={j}
                      style={{
                        background: `hsl(${(i + j) * 60}, 50%, 50%)`,
                      }}
                    />
                  ))}
                  <span className="ml-1 text-[11px] text-neutral-400">
                    {e.attendees} going
                  </span>
                </div>
                <button
                  className="text-[12px] font-medium transition-colors"
                  style={{ color: e.color }}
                >
                  RSVP →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
