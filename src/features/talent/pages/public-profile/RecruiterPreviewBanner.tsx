import { Bookmark, FolderPlus, Send } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useTranslation } from "@/i18n/useTranslation";

interface RecruiterPreviewBannerProps {
  company: string;
  roleTitle: string;
  matchScore: number;
  topSkillsLine?: string;
}

export const RecruiterPreviewBanner = ({
  company,
  roleTitle,
  matchScore,
  topSkillsLine,
}: RecruiterPreviewBannerProps) => {
  const { t } = useTranslation("talent");
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-20 border border-brand-100 bg-brand-50 p-5">
      <div className="flex items-center gap-3">
        <CompanyLogo name={company} size={36} />
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500">
            {t("public.banner.viewing", { company })}
          </p>
          <p className="text-[13px] text-neutral-700">
            {t("public.banner.hiring", { role: roleTitle })}
          </p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[22px] font-semibold leading-none text-brand-700">
          {matchScore}
        </p>
        <p className="text-[11px] text-neutral-500">
          {t("public.banner.match")}
        </p>
        {topSkillsLine && (
          <p className="mt-0.5 text-[11px] text-neutral-400">{topSkillsLine}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 rounded-10 border border-neutral-200 bg-white px-3 py-2 text-[12.5px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
        >
          <FolderPlus size={13} /> {t("public.banner.shortlist")}
        </button>
        <button
          className="flex items-center gap-1.5 rounded-10 border border-neutral-200 bg-white px-3 py-2 text-[12.5px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
        >
          <Bookmark size={13} /> {t("public.banner.save")}
        </button>
        <button
          className="flex items-center gap-1.5 rounded-10 bg-brand-600 px-3 py-2 text-[12.5px] font-medium text-white hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
        >
          <Send size={13} /> {t("public.banner.message")}
        </button>
      </div>
    </div>
  );
};
