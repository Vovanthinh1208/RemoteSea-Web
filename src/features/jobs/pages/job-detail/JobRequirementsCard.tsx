import { RichTextContent } from "@/components/shared/rich-text/RichTextContent";
import { useTranslation } from "@/i18n/useTranslation";

interface JobRequirementsCardProps {
  requirements: string | null;
}

// PB42 lets an employer write these; PB48 AC2 shows them to the candidate.
export const JobRequirementsCard = ({
  requirements,
}: JobRequirementsCardProps) => {
  const { t } = useTranslation("jobs");
  if (!requirements) return null;
  return (
    <div className="rounded-20 border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">
        {t("detail.requirements")}
      </h2>
      <RichTextContent
        className="break-words text-[14px] leading-relaxed text-neutral-600"
        text={requirements}
      />
    </div>
  );
};
