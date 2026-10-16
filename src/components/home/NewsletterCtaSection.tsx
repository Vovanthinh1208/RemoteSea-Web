import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { useTranslation } from "@/i18n/useTranslation";

export const NewsletterCtaSection = () => {
  const { t } = useTranslation("home");
  return (
    <section className="pb-20 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="rounded-24 border border-brand-100 bg-brand-50 p-10 text-center">
          <h2 className="mb-2 text-[28px] font-semibold text-neutral-900">
            {t("newsletter.title")}
            <em className="font-serif-italic text-brand-700">
              {t("newsletter.titleEm")}
            </em>
            {t("newsletter.titleEnd")}
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-neutral-500">
            {t("newsletter.desc")}
          </p>
          <NewsletterForm />
          <p className="mt-3 text-xs text-neutral-400">
            {t("newsletter.fine")}
          </p>
        </div>
      </div>
    </section>
  );
};
