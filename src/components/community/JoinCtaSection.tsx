import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const JOIN_STEPS = [
  {
    num: "01",
    id: 1,
  },
  {
    num: "02",
    id: 2,
  },
  {
    num: "03",
    id: 3,
  },
];

export const JoinCtaSection = () => {
  const { t } = useTranslation("community");
  return (
    <section className="py-20 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[720px] px-6 text-center">
        <Eyebrow className="mb-3">{t("join.eyebrow")}</Eyebrow>
        <h2 className="mb-4 text-[36px] font-semibold text-neutral-900">
          {t("join.title")}
          <em className="font-serif-italic text-brand-700">
            {t("join.titleEm")}
          </em>
          {t("join.titleEnd")}
        </h2>
        <p className="mb-10 text-[15px] leading-relaxed text-neutral-500">
          {t("join.desc")}
        </p>
        <div className="mb-10 grid gap-6 text-left sm:grid-cols-3">
          {JOIN_STEPS.map((s) => (
            <div className="flex gap-4" key={s.num}>
              <span className="mt-0.5 flex-shrink-0 font-mono text-[13px] font-semibold text-brand-600">
                {s.num}
              </span>
              <div>
                <div className="mb-1 text-[15px] font-semibold text-neutral-900">
                  {t(`join.step${s.id}Title`)}
                </div>
                <div className="text-[13px] text-neutral-500">
                  {t(`join.step${s.id}Desc`)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="rounded-12 px-6" size="xl">
            {t("join.request")} <ArrowRight size={16} />
          </Button>
          <button className="inline-flex h-[52px] items-center gap-2 rounded-12 border border-neutral-200 bg-white px-6 text-[15px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none">
            {t("join.conduct")}
          </button>
        </div>
      </div>
    </section>
  );
};
