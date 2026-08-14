const COMMUNITY_STATS = [
  { v: "512", l: "Members" },
  { v: "14", l: "Cities" },
  { v: "86%", l: "Senior+" },
  { v: "$3.4k", l: "Median offer" },
  { v: "28", l: "Meetups in 2025" },
];

export const CommunityStatsBand = () => (
  <section className="border-b border-neutral-100 bg-white">
    <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-6 px-6 py-10 md:grid-cols-5">
      {COMMUNITY_STATS.map((s) => (
        <div className="text-center" key={s.l}>
          <div className="text-[26px] font-semibold tracking-tight text-neutral-900">
            {s.v}
          </div>
          <div className="mt-0.5 text-[13px] text-neutral-400">{s.l}</div>
        </div>
      ))}
    </div>
  </section>
);
