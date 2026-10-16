import { useTranslation } from "@/i18n/useTranslation";

const STATS = [
  { value: "47", labelKey: "home.stats.jobsLive" },
  { value: "12", labelKey: "home.stats.verifiedEmployers" },
  { value: "500+", labelKey: "home.stats.talentProfiles" },
  { value: "$2.4k", labelKey: "home.stats.avgMonthly" },
  { value: "SG · AU · US", labelKey: "home.stats.hiringFrom" },
];

export const StatsBand = () => {
  const { t } = useTranslation("home");
  return (
    <section className="border-y border-neutral-100 bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-6 px-6 py-10 md:grid-cols-5">
        {STATS.map((s) => (
          <div className="text-center" key={s.labelKey}>
            <div className="text-[26px] font-semibold tracking-tight text-neutral-900">
              {s.value}
            </div>
            <div className="mt-0.5 text-[13px] text-neutral-400">
              {t(s.labelKey)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
