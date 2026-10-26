import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedJobs } from "@/features/saved/saved.queries";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

const RECENT_SAVED_LIMIT = 3;

// PB26 AC2: the most recently saved jobs, with a shortcut to the full list.
export const RecentlySavedPanel = () => {
  const { t } = useTranslation("talent");
  const { data, isLoading, isError } = useSavedJobs(1, RECENT_SAVED_LIMIT);
  const saved = data?.savedJobs ?? [];

  return (
    <section className="mb-5 rounded-16 border border-neutral-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13.5px] font-semibold text-neutral-900">
          {t("dashboard.recentSaved.title")}
        </h3>
        <Link
          className="text-[12px] font-medium text-brand-700 hover:underline"
          to={ROUTES.saved}
        >
          {t("dashboard.recentSaved.seeAll")}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 rounded-8" />
      ) : isError ? (
        <p className="text-[12.5px] text-neutral-500">
          {t("dashboard.recentSaved.failed")}
        </p>
      ) : saved.length === 0 ? (
        <p className="text-[12.5px] text-neutral-500">
          {t("dashboard.recentSaved.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {saved.map((s) => (
            <li key={s.jobId}>
              <Link
                className="flex items-start gap-2 rounded-8 p-1.5 hover:bg-neutral-50"
                to={ROUTES.jobDetail(s.jobId)}
              >
                <Bookmark
                  className="mt-0.5 flex-shrink-0 text-brand-600"
                  size={13}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-neutral-900">
                    {s.job.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-neutral-500">
                    {s.job.employer.companyName}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
