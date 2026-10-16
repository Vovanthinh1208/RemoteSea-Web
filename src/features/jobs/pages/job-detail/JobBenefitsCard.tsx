import { useTranslation } from "@/i18n/useTranslation";
import { optionLabel } from "@/i18n/labels";

interface JobBenefitsCardProps {
  benefits: string[];
}

export const JobBenefitsCard = ({ benefits }: JobBenefitsCardProps) => {
  const { t } = useTranslation("jobs");
  if (benefits.length === 0) return null;

  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-6 shadow-card">
      <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">
        {t("detail.benefits")}
      </h2>
      <ul className="space-y-2">
        {benefits.map((b) => (
          <li
            className="flex items-center gap-2 text-[14px] text-neutral-600"
            key={b}
          >
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
            {optionLabel("postjob.opt.benefit", b)}
          </li>
        ))}
      </ul>
    </div>
  );
};
