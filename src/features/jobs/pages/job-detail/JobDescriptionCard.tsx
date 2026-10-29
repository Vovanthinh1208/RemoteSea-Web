import { RichTextContent } from "@/components/shared/rich-text/RichTextContent";
import { useTranslation } from "@/i18n/useTranslation";
interface JobDescriptionCardProps {
  description: string;
}

export const JobDescriptionCard = ({
  description,
}: JobDescriptionCardProps) => {
  const { t } = useTranslation("jobs");
  return (
    <div className="mb-6 rounded-16 border border-neutral-100 bg-white p-6 shadow-card">
      <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">
        {t("detail.aboutRole")}
      </h2>
      <RichTextContent
        className="break-words text-[14px] leading-relaxed text-neutral-600"
        text={description}
      />
    </div>
  );
};
