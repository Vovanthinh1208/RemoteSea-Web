import { Link } from "react-router-dom";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobCardSkeleton } from "@/features/jobs/components/JobCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useSavedJobs } from "@/features/saved/saved.queries";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

const SAVED_JOBS_SKELETON_COUNT = 4;

export const SavedJobsPage = () => {
  const { t } = useTranslation("talent");
  useDocumentTitle(t("saved.docTitle"));
  const { data, isLoading, isError, refetch } = useSavedJobs();
  const savedJobs = data?.savedJobs ?? [];

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
        {t("saved.title")}
      </h1>
      <p className="mb-8 text-[15px] text-neutral-500">{t("saved.subtitle")}</p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: SAVED_JOBS_SKELETON_COUNT }, (_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          action={
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              {t("common.actions.retry")}
            </Button>
          }
          description={t("saved.errorDesc")}
          title={t("saved.errorTitle")}
        />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          action={
            <Link to={ROUTES.jobs}>
              <Button size="sm" variant="outline">
                {t("saved.browse")}
              </Button>
            </Link>
          }
          description={t("saved.emptyDesc")}
          title={t("saved.emptyTitle")}
        />
      ) : (
        <div className="space-y-2">
          {savedJobs.map((s) => (
            <JobCard job={s.job} key={s.jobId} />
          ))}
        </div>
      )}
    </div>
  );
};
