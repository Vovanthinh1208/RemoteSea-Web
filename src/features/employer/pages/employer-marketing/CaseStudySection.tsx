import { GradientInitial } from "@/components/ui/gradient-initial";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const CASE_STUDY_STATS = [
  { numKey: "empmkt.case.s1num", labelKey: "empmkt.case.s1" },
  { num: "42", labelKey: "empmkt.case.s2" },
  { num: "6", labelKey: "empmkt.case.s3" },
  { num: "$3.5k", labelKey: "empmkt.case.s4" },
];

export const CaseStudySection = () => {
  const { t } = useTranslation("empmkt");
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="relative overflow-hidden rounded-24 border border-neutral-100 bg-white p-12 md:p-14">
          <div
            className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-40"
            style={{
              background:
                "radial-gradient(circle, #DCEFDF 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 grid gap-12 md:grid-cols-[1.1fr_1fr]">
            <div>
              <Eyebrow className="mb-3">{t("case.eyebrow")}</Eyebrow>
              <h2 className="mb-4 text-[38px] font-semibold leading-[1.15] tracking-tight text-neutral-900">
                {t("case.quote1")}
                <em className="font-serif-italic text-brand-700">
                  {t("case.quoteEm")}
                </em>
                {t("case.quote2")}
              </h2>
              <p className="mb-8 text-[14.5px] leading-relaxed text-neutral-500">
                {t("case.desc")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {CASE_STUDY_STATS.map((stat) => (
                  <div
                    className="rounded-12 border-l-2 border-brand-600 bg-neutral-50 p-4"
                    key={stat.labelKey}
                  >
                    <div
                      className="font-serif text-[28px] leading-none tracking-tight text-neutral-900"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {stat.numKey ? t(stat.numKey) : stat.num}
                    </div>
                    <div className="mt-1 text-[11.5px] font-medium uppercase tracking-wider text-neutral-400">
                      {t(stat.labelKey)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-full rounded-24 border border-neutral-200 bg-neutral-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <GradientInitial className="h-12 w-12 rounded-12 text-lg">
                    F
                  </GradientInitial>
                  <div>
                    <div className="text-[15px] font-semibold text-neutral-900">
                      Finch Labs
                    </div>
                    <div className="text-[12.5px] text-neutral-400">
                      {t("case.companyMeta")}
                    </div>
                  </div>
                </div>
                <p
                  className="mb-5 font-serif text-[19px] italic leading-snug text-neutral-800"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {t("case.quote")}
                </p>
                <div className="flex items-center gap-2.5 border-t border-neutral-200 pt-4">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-semibold text-white">
                    JC
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-neutral-900">
                      Jia Chen
                    </div>
                    <div className="text-[11.5px] text-neutral-400">
                      {t("case.author")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
