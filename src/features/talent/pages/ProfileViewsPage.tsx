import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { ProfileViewsChart } from "@/features/talent/components/talent-dashboard/ProfileViewsChart";
import { useProfileViewAnalytics } from "@/features/talent/talent.queries";
import { ROUTES } from "@/constants/routes";
import { formatLocalDateTime } from "@/utils/format";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

// PB27: /talent/profile/views — views by day / week / month and the
// companies that looked at the profile, with when.
export const ProfileViewsPage = () => {
  const { t } = useTranslation("talent");
  const { data, isLoading, isError, refetch } = useProfileViewAnalytics();
  useDocumentTitle(t("views.docTitle"));

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-6">
      <Link
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        to={ROUTES.talent}
      >
        <ArrowLeft size={14} /> {t("views.back")}
      </Link>
      <h1 className="text-[22px] font-semibold text-neutral-900">
        {t("views.title")}
      </h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        {t("views.subtitle")}
      </p>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-16" />
          <Skeleton className="h-48 rounded-16" />
        </div>
      ) : isError || !data ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-6 text-center">
          <p className="text-sm text-neutral-600">{t("views.loadFailed")}</p>
          <Button className="mt-4" variant="soft" onClick={() => refetch()}>
            {t("views.retry")}
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Eye}
              label={t("views.today")}
              size="md"
              value={data.viewsToday}
            />
            <StatCard
              icon={Eye}
              label={t("views.week")}
              size="md"
              value={data.viewsThisWeek}
            />
            <StatCard
              icon={Eye}
              label={t("views.month")}
              size="md"
              value={data.viewsThisMonth}
            />
            <StatCard
              icon={Eye}
              label={t("views.total")}
              size="md"
              sub={t("views.unique", { count: data.uniqueViewers })}
              value={data.totalViews}
            />
          </div>

          <section className="mb-6 rounded-16 border border-neutral-100 bg-white p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-neutral-900">
              {t("views.chartTitle")}
            </h2>
            <ProfileViewsChart daily={data.daily} height={140} />
          </section>

          <section className="rounded-16 border border-neutral-100 bg-white p-5">
            <h2 className="mb-1 text-[14px] font-semibold text-neutral-900">
              {t("views.viewersTitle")}
            </h2>
            <p className="mb-4 text-[12.5px] text-neutral-500">
              {t("views.viewersHint")}
            </p>
            {data.recentViewers.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-500">
                {t("views.empty")}
              </p>
            ) : (
              <ul className="divide-y divide-neutral-50">
                {data.recentViewers.map((v, i) => (
                  <li
                    className="flex items-center justify-between gap-3 py-3"
                    key={`${v.company?.slug ?? "anon"}-${v.viewedAt}-${i}`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-8 bg-neutral-100 text-neutral-500">
                        <Building2 size={14} />
                      </span>
                      {v.company ? (
                        <Link
                          className="truncate text-[13.5px] font-medium text-neutral-900 hover:underline"
                          to={ROUTES.companyProfile(v.company.slug)}
                        >
                          {v.company.name}
                        </Link>
                      ) : (
                        <span className="truncate text-[13.5px] text-neutral-600">
                          {t("views.unknownCompany")}
                        </span>
                      )}
                    </span>
                    <time
                      className="flex-shrink-0 text-[12px] text-neutral-500"
                      dateTime={v.viewedAt}
                    >
                      {formatLocalDateTime(v.viewedAt, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};
