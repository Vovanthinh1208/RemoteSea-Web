import { ApplyButton } from "@/features/jobs/components/ApplyButton";
import { SaveJobButton } from "@/features/jobs/components/SaveJobButton";
import { MS_PER_DAY, timeAgo } from "@/features/jobs/jobs.utils";
import { formatSalaryRange } from "@/utils/format";
import type { Job } from "@/types/job";
import { useTranslation } from "@/i18n/useTranslation";

const daysUntil = (dateString: string | null): number | null => {
  if (!dateString) return null;
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / MS_PER_DAY));
};

interface ApplyCardProps {
  job: Job;
}

export const ApplyCard = ({ job }: ApplyCardProps) => {
  const { t, formatNumber } = useTranslation("jobs");
  const country = job.country ?? job.employer.hqCountry ?? t("card.remote");
  const expiresInDays = daysUntil(job.expiresAt);
  // Previously `(min ?? 0)–(max ?? 0)` — a job with no salary showed "$0–0 /mo".
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);

  return (
    <div className="rounded-16 border border-brand-100 bg-brand-50 p-6">
      <div className="mb-1 font-mono text-[22px] font-semibold text-neutral-900">
        {salary ?? t("detail.salaryNotSpecified")}
        {salary && (
          <span className="text-[14px] font-normal text-neutral-500">
            {t("detail.perMonth")}
          </span>
        )}
      </div>
      <p className="mb-5 text-[12px] text-neutral-400">
        {t("detail.paidVia", {
          currency: job.currency,
          method: country === "US" ? t("detail.payDeel") : t("detail.payWise"),
        })}
      </p>
      <ApplyButton jobId={job.id} />
      <SaveJobButton jobId={job.id} />
      <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-neutral-400">{t("detail.postedLabel")}</span>
          <span className="font-medium text-neutral-700">
            {t("common.time.ago", {
              time: timeAgo(job.publishedAt ?? job.createdAt),
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-neutral-400">{t("detail.applicants")}</span>
          <span className="font-medium text-neutral-700">
            {formatNumber(job.applyCount)}
          </span>
        </div>
        {expiresInDays !== null && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-neutral-400">{t("detail.expiresIn")}</span>
            <span className="font-medium text-neutral-700">
              {t("detail.days", { count: expiresInDays })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
