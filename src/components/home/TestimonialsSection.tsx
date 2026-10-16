import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Phạm Tuấn",
    initials: "PT",
    color: "#2E9B52",
  },
  {
    id: 2,
    name: "Nguyễn Anh",
    initials: "NA",
    color: "#0EA5E9",
  },
  {
    id: 3,
    name: "Lê Hoàng",
    initials: "LH",
    color: "#EE4D2D",
  },
];

export const TestimonialsSection = () => {
  const { t } = useTranslation("home");
  return (
    <section className="border-y border-neutral-100 bg-white py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-10 text-center">
          <Eyebrow className="mb-3">{t("testimonials.eyebrow")}</Eyebrow>
          <h2 className="text-[32px] font-semibold text-neutral-900">
            {t("testimonials.from")}
            <em className="font-serif-italic">{t("testimonials.apply")}</em>
            {t("testimonials.to")}
            <em className="font-serif-italic">{t("testimonials.offer")}</em>.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <div
              className="rounded-16 border border-neutral-100 bg-neutral-50 p-6"
              key={item.name}
            >
              <p className="mb-5 text-[14px] italic leading-relaxed text-neutral-700">
                &ldquo;{t(`testimonials.${item.id}.quote`)}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                  style={{ background: item.color }}
                >
                  {item.initials}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-neutral-900">
                    {item.name}
                  </div>
                  <div className="text-[12px] text-neutral-400">
                    {t(`testimonials.${item.id}.title`)}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-amber-700">
                    {t(`testimonials.${item.id}.meta`)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
