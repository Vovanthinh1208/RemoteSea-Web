import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useJobQuery } from "@/features/jobs/jobs.queries";
import { useSalaryBenchmarks } from "@/features/salary/salary.queries";
import { JobHeaderCard } from "@/features/jobs/pages/job-detail/JobHeaderCard";
import { JobDescriptionCard } from "@/features/jobs/pages/job-detail/JobDescriptionCard";
import { JobSkillsCard } from "@/features/jobs/pages/job-detail/JobSkillsCard";
import { JobBenefitsCard } from "@/features/jobs/pages/job-detail/JobBenefitsCard";
import { ApplyCard } from "@/features/jobs/pages/job-detail/ApplyCard";
import { VnSignalCard } from "@/features/jobs/pages/job-detail/VnSignalCard";
import { SalaryBenchmarkCard } from "@/features/jobs/pages/job-detail/SalaryBenchmarkCard";
import { QuickFactsCard } from "@/features/jobs/pages/job-detail/QuickFactsCard";
import { JobCompanyCard } from "@/features/jobs/pages/job-detail/JobCompanyCard";
import {
  MatchCard,
  MatchSkillsPrompt,
} from "@/features/jobs/pages/job-detail/MatchCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useJobPostingSchema } from "@/hooks/useJobPostingSchema";
import { LEVEL_LABELS, JOB_TYPE_LABELS } from "@/utils/labels";
import { ROUTES } from "@/constants/routes";
import { formatSalaryRange } from "@/utils/format";
import {
  useMyMatch,
  useNeedsSkillsForMatch,
} from "@/features/matching/useMyMatch";
import { translate } from "@/i18n/runtime";
import { useTranslation } from "@/i18n/useTranslation";
import { STATUS_LABEL } from "@/features/employer/employer-dashboard.utils";

const jobMetaDescription = (
  job: NonNullable<ReturnType<typeof useJobQuery>["data"]>
): string => {
  const range = formatSalaryRange(job.salaryMin, job.salaryMax, {
    prefix: `${job.currency} `,
  });
  const salary = range
    ? ` · ${range}${translate("jobs.filters.perMonthSuffix")}`
    : "";
  const location = job.isRemote
    ? translate("jobs.card.remote")
    : (job.country ?? translate("jobs.card.remote"));
  return translate("jobs.detail.meta", {
    level: LEVEL_LABELS[job.level],
    type: JOB_TYPE_LABELS[job.jobType],
    company: job.employer.companyName,
    location,
    salary,
  });
};

export const JobDetailPage = () => {
  const { t } = useTranslation("jobs");
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError } = useJobQuery(id);
  // Only fetched/rendered when the job actually has a salary — the benchmark
  // card compares against it, so it's meaningless (and shows $0) otherwise.
  const hasSalary = job?.salaryMin != null;
  const { data: benchmarks } = useSalaryBenchmarks(hasSalary);
  const match = useMyMatch(job);
  const needsSkills = useNeedsSkillsForMatch(job);
  useDocumentTitle(
    job
      ? t("detail.docTitle", {
          title: job.title,
          company: job.employer.companyName,
        })
      : t("detail.fallbackTitle"),
    job ? jobMetaDescription(job) : undefined
  );
  // A preview isn't a public listing — keep it out of search engines.
  useJobPostingSchema(job?.isPreview ? undefined : job);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-10">
        <Skeleton className="mb-8 h-4 w-24" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-16" />
            <Skeleton className="h-48 rounded-16" />
            <Skeleton className="h-24 rounded-16" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-16" />
            <Skeleton className="h-40 rounded-16" />
            <Skeleton className="h-32 rounded-16" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {t("detail.notFoundTitle")}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {t("detail.notFoundDesc")}
        </p>
        <Link className="mt-6" to={ROUTES.jobs}>
          <Button variant="primary">{t("detail.backToJobs")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10">
      <Link
        className="mb-8 inline-flex items-center gap-1.5 rounded-8 text-sm text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
        to={ROUTES.jobs}
      >
        <ArrowLeft size={14} /> {t("detail.back")}
      </Link>

      {job.isPreview && (
        <div
          className="mb-6 rounded-16 border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
          role="status"
        >
          <strong className="font-semibold">{t("detail.previewTitle")}</strong>{" "}
          {t("detail.previewBody", { status: STATUS_LABEL[job.status] })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content. min-w-0: a grid item won't shrink below its content's
            min-content width, so one long unbroken word/URL in the description
            used to stretch the whole page sideways. */}
        <div className="min-w-0">
          <JobHeaderCard job={job} />
          <JobDescriptionCard description={job.description} />
          <JobSkillsCard skills={job.skills} />
          <JobBenefitsCard benefits={job.benefits} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            {!job.isPreview && <ApplyCard job={job} />}
            {match ? (
              <MatchCard match={match} />
            ) : (
              needsSkills && <MatchSkillsPrompt />
            )}
            <VnSignalCard
              companyName={job.employer.companyName}
              vnHireCount={job.vnHireCount}
            />
            {hasSalary && (
              <SalaryBenchmarkCard benchmarks={benchmarks} job={job} />
            )}
            <QuickFactsCard job={job} />
            <JobCompanyCard job={job} />
          </div>
        </div>
      </div>
    </div>
  );
};
