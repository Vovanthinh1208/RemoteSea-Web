import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const PROCESS = [
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

const LAST_STEP_INDEX = PROCESS.length - 1;

export const ProcessSection = () => {
  const { t } = useTranslation("empmkt");
  return (
    <section className="border-y border-neutral-100 bg-white py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        <Eyebrow className="mb-3">{t("process.eyebrow")}</Eyebrow>
        <h2 className="mb-10 text-[32px] font-semibold tracking-tight text-neutral-900">
          {t("process.title")}
          <em className="font-serif-italic text-brand-700">
            {t("process.titleEm")}
          </em>
        </h2>
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {PROCESS.map((step, i) => (
            <Fragment key={step.num}>
              <div className="flex flex-col gap-3 rounded-24 border border-neutral-100 p-7">
                <div
                  className="font-serif text-[44px] italic leading-none text-brand-200"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 className="mb-2 text-[18px] font-semibold tracking-tight text-neutral-900">
                    {t(`process.${step.id}.title`)}
                  </h3>
                  <p className="mb-3 text-[14px] leading-relaxed text-neutral-500">
                    {t(`process.${step.id}.desc`)}
                  </p>
                  <ul className="space-y-1.5">
                    {[1, 2, 3].map((n) => (
                      <li
                        className="flex items-center gap-2 text-[13px] text-neutral-700"
                        key={n}
                      >
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
                        {t(`process.${step.id}.i${n}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {i < LAST_STEP_INDEX && (
                <div className="hidden place-items-center px-2 text-neutral-300 md:grid">
                  <ArrowRight size={20} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
