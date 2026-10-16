import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const HOW_IT_WORKS = [
  {
    num: "01",
    titleKey: "home.how.step1Title",
    descKey: "home.how.step1Desc",
  },
  {
    num: "02",
    titleKey: "home.how.step2Title",
    descKey: "home.how.step2Desc",
  },
  {
    num: "03",
    titleKey: "home.how.step3Title",
    descKey: "home.how.step3Desc",
  },
];

export const HowItWorksSection = () => {
  const { t } = useTranslation("home");
  return (
    <section className="py-20 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-12 text-center">
          <Eyebrow className="mb-3">{t("how.eyebrow")}</Eyebrow>
          <h2 className="text-[36px] font-semibold tracking-tight text-neutral-900">
            {t("how.title")}
            <em className="font-serif-italic">{t("how.titleEm")}</em>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
            {t("how.subtitle")}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div
              className="rounded-16 border border-neutral-100 bg-white p-6"
              key={step.num}
            >
              <div className="mb-3 text-[13px] font-semibold text-brand-600">
                {step.num}
              </div>
              <h3 className="mb-2 text-[17px] font-semibold text-neutral-900">
                {t(step.titleKey)}
              </h3>
              <p className="text-[14px] leading-relaxed text-neutral-500">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
