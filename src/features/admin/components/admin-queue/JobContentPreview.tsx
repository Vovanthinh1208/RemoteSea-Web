import { RichTextContent } from "@/components/shared/rich-text/RichTextContent";
import { useTranslation } from "@/i18n/useTranslation";
import type { AdminJob } from "@/types/admin";

/** Read the submitted content before deciding; pending jobs cannot use the
 * public job route. Use the same safe Markdown renderer as the public view. */
export const JobContentPreview = ({ job }: { job: AdminJob }) => {
  const { t } = useTranslation("jobs");
  const sections = [
    ["aboutRole", job.description],
    ["responsibilities", job.responsibilities],
    ["requirements", job.requirements],
  ] as const;
  return (
    <div className="mb-5 space-y-4 border-b border-neutral-100 pb-5">
      {sections.map(([key, text]) =>
        text ? (
          <section key={key} aria-label={t(`detail.${key}`)}>
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">
              {t(`detail.${key}`)}
            </h3>
            <RichTextContent
              text={text}
              className="break-words text-sm leading-relaxed text-neutral-600"
            />
          </section>
        ) : null
      )}
      {!!job.benefits.length && (
        <section aria-label={t("detail.benefits")}>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">
            {t("detail.benefits")}
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600">
            {job.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </section>
      )}
      {job.applicationUrl && (
        <p className="break-all text-xs text-neutral-500">
          {t("detail.applicationLink")}: {job.applicationUrl}
        </p>
      )}
    </div>
  );
};
