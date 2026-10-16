import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";
const WHY = [
  {
    num: "3.5×",
    id: 1,
  },
  {
    num: null,
    id: 2,
  },
  {
    num: "87%",
    id: 3,
  },
];

export const WhySection = () => {
  const { t } = useTranslation("empmkt");
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-12 text-center">
          <Eyebrow className="mb-3">{t("why.eyebrow")}</Eyebrow>
          <h2 className="text-[36px] font-semibold tracking-tight text-neutral-900">
            {t("why.title")}
            <em className="font-serif-italic text-brand-700">
              {t("why.titleEm")}
            </em>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-500">
            {t("why.desc")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {WHY.map((item) => (
            <div
              className="rounded-24 border border-neutral-100 bg-white p-8 transition-colors hover:border-neutral-200"
              key={item.id}
            >
              <div
                className="mb-4 font-serif text-[64px] italic leading-none tracking-tight text-brand-700"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {item.num ?? t("why.2.num")}
              </div>
              <h3 className="mb-2 text-[17px] font-semibold tracking-tight text-neutral-900">
                {t(`why.${item.id}.title`)}
              </h3>
              <p className="text-[14px] leading-relaxed text-neutral-500">
                {t(`why.${item.id}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
