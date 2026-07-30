import { Link } from "react-router-dom";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobCardSkeleton } from "@/features/jobs/components/JobCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useSavedJobs } from "@/features/saved/saved.queries";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";

const SAVED_JOBS_SKELETON_COUNT = 4;

export const SavedJobsPage = () => {
  useDocumentTitle("Saved Jobs");
  const { data, isLoading, isError, refetch } = useSavedJobs();
  const savedJobs = data?.savedJobs ?? [];

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
        Saved jobs
      </h1>
      <p className="mb-8 text-[15px] text-neutral-500">
        Jobs you've bookmarked to come back to later.
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from(
            { length: SAVED_JOBS_SKELETON_COUNT },
            (_, i) => (
              <JobCardSkeleton key={i} />
            )
          )}
        </div>
      ) : isError ? (
        <EmptyState
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          }
          description="Something went wrong loading your saved jobs."
          title="Couldn't load saved jobs"
        />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          action={
            <Link to={ROUTES.jobs}>
              <Button size="sm" variant="outline">
                Browse jobs
              </Button>
            </Link>
          }
          description="Bookmark a job from its listing to save it here."
          title="No saved jobs yet"
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
