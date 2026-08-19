import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { useUpcomingInterviews } from "@/features/interviews/interview.queries";
import {
  formatTime,
  groupInterviewsByDay,
} from "@/features/interviews/interview.utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";

const SKELETON_GROUP_COUNT = 2;
const SKELETON_ROWS_PER_GROUP = 2;

// Shape-matched to the actual row (time column + two text lines + duration),
// not one solid block — same reasoning as ReviewsSectionSkeleton/
// ScorecardSectionSkeleton's item-row skeletons.
const UpcomingInterviewRowSkeleton = () => (
  <div className="flex items-center gap-4 rounded-10 border border-neutral-100 bg-white px-4 py-3">
    <Skeleton className="h-3.5 w-12 flex-shrink-0" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-3 w-10 flex-shrink-0" />
  </div>
);

const UpcomingInterviewsSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: SKELETON_GROUP_COUNT }, (_, i) => (
      <div key={i}>
        <Skeleton className="mb-2 h-3.5 w-32" />
        <div className="space-y-2">
          {Array.from({ length: SKELETON_ROWS_PER_GROUP }, (_, j) => (
            <UpcomingInterviewRowSkeleton key={j} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const UpcomingInterviewsPage = () => {
  useDocumentTitle("Interview schedule — Employer Dashboard");
  const { data, isLoading, isError, refetch } = useUpcomingInterviews();

  const groups = data ? groupInterviewsByDay(data.interviews) : [];

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="mx-auto max-w-[820px] px-6 py-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] text-neutral-500">
            <Link
              className="hover:text-neutral-700"
              to={ROUTES.employerDashboard}
            >
              ← Dashboard
            </Link>
            <span>·</span>
            <span>Interview Schedule</span>
          </div>
          <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
            {data?.scope === "mine" ? (
              <>
                Your upcoming{" "}
                <em className="font-serif-italic text-brand-700">
                  interviews.
                </em>
              </>
            ) : (
              <>
                Team interview{" "}
                <em className="font-serif-italic text-brand-700">schedule.</em>
              </>
            )}
          </h1>
          <p className="text-[15px] text-neutral-500">
            {data?.scope === "mine"
              ? "Every confirmed interview assigned to you, soonest first."
              : "Every confirmed interview across the company, soonest first."}
          </p>
        </div>

        {isLoading ? (
          <UpcomingInterviewsSkeleton />
        ) : isError ? (
          <EmptyState
            action={
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
            description="Something went wrong loading the schedule."
            title="Couldn't load interviews"
          />
        ) : groups.length === 0 ? (
          <EmptyState
            description="Confirmed interviews will show up here, grouped by day."
            title="No upcoming interviews"
          />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-neutral-400">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.interviews.map((interview) => (
                    <Link
                      className="flex items-center gap-4 rounded-10 border border-neutral-100 bg-white px-4 py-3 transition-colors hover:border-neutral-200"
                      key={interview.id}
                      to={ROUTES.applicationInterview(interview.applicationId)}
                    >
                      <span className="w-[68px] flex-shrink-0 whitespace-nowrap text-[13px] font-medium text-neutral-700">
                        {formatTime(interview.confirmedSlot)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-neutral-900">
                          {interview.talentName ?? "Candidate"}
                        </span>
                        <span className="block truncate text-[12px] text-neutral-500">
                          {interview.jobTitle}
                          {data?.scope === "team" &&
                            interview.interviewerName && (
                              <> · with {interview.interviewerName}</>
                            )}
                        </span>
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-3">
                        <span className="text-[12px] text-neutral-400">
                          {interview.durationMinutes} min
                        </span>
                        {interview.meetingUrl && (
                          <>
                            <Video
                              aria-hidden="true"
                              className="text-neutral-400"
                              size={15}
                            />
                            <span className="sr-only">
                              Meeting link available
                            </span>
                          </>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
