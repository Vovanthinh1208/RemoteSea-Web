import { CompanyLogo } from "@/components/ui/company-logo";
import { Tag } from "@/components/ui/tag";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import {
  colorFor,
  formatSalary,
  hoursSince,
  JOB_TYPE_LABELS,
  LEVEL_LABELS,
  queuedAt,
  waitCls,
  waitFmt,
} from "@/features/admin/admin.utils";
import type { AdminJob } from "@/types/admin";
import { useTranslation } from "@/i18n/useTranslation";
import { translate } from "@/i18n/runtime";
import { filterValueLabel } from "@/features/jobs/jobs.utils";

const HOURS_PER_DAY = 24;

const submittedLabel = (dateString: string): string => {
  const h = hoursSince(dateString);
  if (h < 1) return translate("common.time.justNow");
  if (h < HOURS_PER_DAY) return translate("common.time.hourAgo", { n: h });
  return translate("common.time.dayAgo", { n: Math.floor(h / HOURS_PER_DAY) });
};

const jobRegion = (j: AdminJob): string =>
  j.country ?? (j.isRemote ? translate("admin.header.remote") : "—");

interface JobSummaryHeaderProps {
  job: AdminJob;
}

export const JobSummaryHeader = ({ job }: JobSummaryHeaderProps) => {
  const { t } = useTranslation("admin");
  const waitHours = hoursSince(queuedAt(job));
  const tags = [
    job.categories[0]?.category.name
      ? filterValueLabel(job.categories[0].category.name)
      : t("header.other"),
    LEVEL_LABELS[job.level],
    JOB_TYPE_LABELS[job.jobType],
    jobRegion(job),
  ];

  return (
    <div className="border-b border-neutral-100 p-5">
      <div className="flex items-start gap-4">
        <CompanyLogo
          color={colorFor(job.employer.companyName)}
          name={job.employer.companyName}
          size={46}
        />
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-neutral-500">
              {t("header.submittedBy")}
            </span>
            <span className="text-[13px] font-semibold text-neutral-900">
              {job.employer.companyName}
            </span>
            <VerifiedBadge isVerified={job.employer.isVerified} size="md" />
          </div>
          <h2 className="mb-2 text-[18px] font-semibold text-neutral-900">
            {job.title}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[17px] font-semibold text-neutral-900">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            {t("jobs.filters.perMonthSuffix")}
          </div>
          <div className="text-[12px] text-neutral-400">
            {submittedLabel(queuedAt(job))}
          </div>
          <span
            className={`mt-1 inline-block font-mono text-[12px] ${waitCls(waitHours)}`}
          >
            {t("header.waited", { wait: waitFmt(waitHours) })}
          </span>
        </div>
      </div>
    </div>
  );
};
