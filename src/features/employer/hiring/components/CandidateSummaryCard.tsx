import { useState } from "react";
import { Paperclip } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/utils/cn";
import { formatSalaryWithCurrency } from "@/utils/format";
import type { ApplicantWithJob } from "@/features/employer/employer.queries";
import { useTranslation } from "@/i18n/useTranslation";
import { optionLabel } from "@/i18n/labels";

interface CandidateSummaryCardProps {
  applicant: ApplicantWithJob;
}

export const CandidateSummaryCard = ({
  applicant,
}: CandidateSummaryCardProps) => {
  const { t } = useTranslation("employer");
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const { talent } = applicant;
  const salary = formatSalaryWithCurrency(
    talent.desiredSalaryMin,
    talent.desiredSalaryMax,
    talent.currency
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-medium text-neutral-900">
          {talent.user.name ?? t("row.candidate")}
        </p>
        {talent.headline && (
          <p className="mt-0.5 text-[12.5px] text-neutral-500">
            {talent.headline}
          </p>
        )}
      </div>

      <dl className="space-y-2 text-[12.5px]">
        {talent.yearsExperience != null && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">{t("summary.experience")}</dt>
            <dd className="text-neutral-700">
              {t("summary.yrs", {
                years: talent.yearsExperience,
                level: talent.level,
              })}
            </dd>
          </div>
        )}
        {salary && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">{t("summary.salary")}</dt>
            <dd className="text-neutral-700">{salary}</dd>
          </div>
        )}
        {talent.country && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">{t("summary.location")}</dt>
            <dd className="text-neutral-700">{talent.country}</dd>
          </div>
        )}
        {talent.timezone && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">{t("summary.timezone")}</dt>
            <dd className="text-neutral-700">
              {optionLabel("talent.opt.tz", talent.timezone)}
            </dd>
          </div>
        )}
      </dl>

      {talent.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {talent.skills.map(({ skill }) => (
            <Tag key={skill.id}>{skill.name}</Tag>
          ))}
        </div>
      )}

      {applicant.resumeUrl && (
        <a
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full"
          )}
          href={applicant.resumeUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Paperclip size={13} /> {t("summary.resume")}
        </a>
      )}

      {applicant.coverLetter && (
        <div>
          <button
            className="rounded-4 text-[12px] font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => setCoverLetterOpen((open) => !open)}
          >
            {coverLetterOpen ? t("row.hideCover") : t("row.viewCover")}
          </button>
          {coverLetterOpen && (
            <p className="mt-2 whitespace-pre-line rounded-10 bg-neutral-50 p-3 text-[12.5px] leading-relaxed text-neutral-600">
              {applicant.coverLetter}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
