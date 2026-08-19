import { Link, useParams } from "react-router-dom";
import { CalendarClock, MessageCircle } from "lucide-react";
import { useApplication } from "@/features/applications/applications.queries";
import { ApplicationTimeline } from "@/features/talent/components/talent-dashboard/ApplicationTimeline";
import {
  STATUS_BADGE,
  STATUS_TO_BUCKET,
} from "@/features/talent/talent-dashboard.utils";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";

// Mirrors ApplicationTimeline's own TimelineRow shape (small circle + a
// connecting line + two text lines) rather than a generic bar skeleton — the
// real content below is a timeline, so the loading state should read as one
// loading, not as an unrelated shape swapped out once data arrives.
const TIMELINE_SKELETON_COUNT = 3;
const TimelineRowSkeleton = ({ last }: { last?: boolean }) => (
  <div className="flex items-start gap-3">
    <div className="flex flex-col items-center self-stretch">
      <Skeleton className="h-4 w-4 flex-shrink-0 rounded-full" />
      {!last && <span className="w-px flex-1 bg-neutral-100" />}
    </div>
    <div className="min-w-0 flex-1 space-y-1.5 pb-4">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  </div>
);

export const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const {
    data: application,
    isLoading,
    isError,
    refetch,
  } = useApplication(applicationId);

  useDocumentTitle(
    application ? application.job.employer.companyName : "Application"
  );

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <ApplicationDetailHeader
        backHref={ROUTES.talent}
        className="mb-6"
        subtitle={application?.job.title}
        title={
          application ? application.job.employer.companyName : "Application"
        }
      />

      {/* One shell whose own classes never change across loading/error/content
          — only what's inside swaps. Otherwise the card visibly gains its
          shadow the instant data arrives instead of holding it throughout. */}
      <div className="overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
        {isLoading ? (
          <div className="space-y-1 p-5">
            <Skeleton className="mb-4 h-6 w-24 rounded-full" />
            {Array.from({ length: TIMELINE_SKELETON_COUNT }, (_, i) => (
              <TimelineRowSkeleton
                key={i}
                last={i === TIMELINE_SKELETON_COUNT - 1}
              />
            ))}
          </div>
        ) : isError || !application ? (
          <div className="p-5">
            <EmptyState
              action={
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              }
              description="This application doesn't exist, or isn't yours."
              title="Couldn't load this application"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <Badge
                variant={
                  STATUS_BADGE[STATUS_TO_BUCKET[application.status]].variant
                }
              >
                {STATUS_BADGE[STATUS_TO_BUCKET[application.status]].label}
              </Badge>
              {/* Same icon-only circular link treatment ApplicationsTable and
                  ApplicantsPanel already use for these exact two routes — a
                  labeled button here would be the only place in the app
                  saying "Message"/"Interview" instead of just showing it. */}
              <div className="flex items-center gap-1">
                <Link
                  aria-label="Message about this application"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  to={ROUTES.applicationMessages(application.id)}
                >
                  <MessageCircle size={16} />
                </Link>
                {application.status === "INTERVIEW" && (
                  <Link
                    aria-label="View interview"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                    to={ROUTES.applicationInterview(application.id)}
                  >
                    <CalendarClock size={16} />
                  </Link>
                )}
              </div>
            </div>
            <ApplicationTimeline application={application} />
          </>
        )}
      </div>
    </div>
  );
};
