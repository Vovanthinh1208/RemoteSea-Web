import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { formatSlot } from "@/features/interviews/interview.utils";
import { useTranslation } from "@/i18n/useTranslation";
import type { EmployerDashboardOverview } from "@/types/employer";

interface DashboardOverviewPanelProps {
  overview: EmployerDashboardOverview;
}

// PB34 AC2: listings per status, applications nobody has opened yet, and the
// interviews coming up in the next 7 days.
export const DashboardOverviewPanel = ({
  overview,
}: DashboardOverviewPanelProps) => {
  const { t, formatNumber } = useTranslation("employer");
  const { jobCounts, unseenApplications, upcomingInterviews } = overview;
  const counts = [
    { key: "active", value: jobCounts.ACTIVE },
    { key: "pendingReview", value: jobCounts.PENDING_REVIEW },
    { key: "draft", value: jobCounts.DRAFT },
    { key: "closed", value: jobCounts.CLOSED },
  ];

  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-5">
      <h3 className="mb-3 text-[14px] font-semibold text-neutral-900">
        {t("overview.title")}
      </h3>
      <dl className="grid grid-cols-2 gap-2">
        {counts.map(({ key, value }) => (
          <div className="rounded-10 bg-neutral-50 px-3 py-2" key={key}>
            <dt className="text-[11.5px] text-neutral-500">
              {t(`overview.${key}`)}
            </dt>
            <dd className="text-[16px] font-semibold text-neutral-900">
              {formatNumber(value)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-[12.5px] text-neutral-600">
        {t("overview.unseen")}
        <strong className="text-[14px] text-neutral-900">
          {formatNumber(unseenApplications)}
        </strong>
      </p>
      <div className="mt-3 border-t border-neutral-100 pt-3">
        <p className="mb-2 text-[12.5px] font-medium text-neutral-700">
          {t("overview.interviews")}
        </p>
        {upcomingInterviews.interviews.length === 0 ? (
          <p className="text-[12px] text-neutral-400">
            {t("overview.noInterviews")}
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingInterviews.interviews.map((interview) => (
              <li className="text-[12.5px]" key={interview.id}>
                <Link
                  className="block rounded-8 hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none"
                  to={ROUTES.interviewSchedule}
                >
                  <span className="block truncate font-medium text-neutral-800">
                    {interview.talentName ?? interview.jobTitle}
                    {interview.talentName && ` · ${interview.jobTitle}`}
                  </span>
                  <span className="text-neutral-500">
                    {formatSlot(interview.confirmedSlot)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
