const STATS = [
  { value: "47", label: "Jobs live" },
  { value: "12", label: "Verified employers" },
  { value: "500+", label: "Talent profiles" },
  { value: "$2.4k", label: "Avg monthly" },
  { value: "SG · AU · US", label: "Hiring from" },
];

export const StatsBand = () => (
  <section className="border-y border-neutral-100 bg-white">
    <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-6 px-6 py-10 md:grid-cols-5">
      {STATS.map((s) => (
        <div className="text-center" key={s.label}>
          <div className="text-[26px] font-semibold tracking-tight text-neutral-900">{s.value}</div>
          <div className="mt-0.5 text-[13px] text-neutral-400">{s.label}</div>
        </div>
      ))}
    </div>
  </section>
);
