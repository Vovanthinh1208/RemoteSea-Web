import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useTranslation } from "@/i18n/useTranslation";

const ITEM_IDS = [1, 2, 3, 4, 5, 6] as const;

const NO_ITEM_OPEN = -1;

export const FAQSection = () => {
  const { t } = useTranslation("empmkt");
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[760px] px-6">
        <Eyebrow className="mb-3">{t("faq.eyebrow")}</Eyebrow>
        <h2 className="mb-10 text-[32px] font-semibold tracking-tight text-neutral-900">
          {t("faq.title")}
          <em className="font-serif-italic text-brand-700">
            {t("faq.titleEm")}
          </em>
        </h2>

        <div className="flex flex-col gap-2">
          {ITEM_IDS.map((id, i) => (
            <div
              className={`rounded-12 border bg-white transition-colors ${
                openIndex === i ? "border-neutral-200" : "border-neutral-100"
              }`}
              key={id}
            >
              <button
                className="flex w-full items-center justify-between gap-4 rounded-12 px-6 py-[18px] text-left focus-visible:shadow-focus focus-visible:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? NO_ITEM_OPEN : i)}
              >
                <span className="text-[15px] font-medium tracking-tight text-neutral-900">
                  {t(`faq.${id}.q`)}
                </span>
                {openIndex === i ? (
                  <Minus className="flex-shrink-0 text-neutral-400" size={16} />
                ) : (
                  <Plus className="flex-shrink-0 text-neutral-400" size={16} />
                )}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-[14.5px] leading-relaxed text-neutral-500">
                  {t(`faq.${id}.a`)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
