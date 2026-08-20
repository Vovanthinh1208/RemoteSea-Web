import { Link, useParams } from "react-router-dom";
import { CalendarClock, MessageCircle } from "lucide-react";
import { useApplication } from "@/features/applications/applications.queries";
import { useInterview } from "@/features/interviews/interview.queries";
import { hasOccurred } from "@/features/interviews/interview.utils";
import { UpcomingInterviewCard } from "@/features/interviews/components/UpcomingInterviewCard";
import { ApplicationTimeline } from "@/features/talent/components/talent-dashboard/ApplicationTimeline";
import {
  STATUS_BADGE,
  STATUS_TO_BUCKET,
} from "@/features/talent/talent-dashboard.utils";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import type { ApplicationStatus } from "@/types/application";

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

// One friendly, forward-looking line per status — the timeline below already
// shows what's happened; this is the one thing this page adds on top: what
// to expect next. INTERVIEW is handled separately (an inline interview
// card/prompt carries more signal than a single sentence could).
const STATUS_GUIDANCE: Partial<Record<ApplicationStatus, string>> = {
  PENDING:
    "Your application is in the queue. Most employers respond within a few days.",
  REVIEWING: "The employer is currently reviewing your application.",
  SHORTLISTED:
    "You've been shortlisted — the employer may reach out to schedule an interview soon.",
  OFFERED: "This employer has extended you an offer. Congratulations!",
  REJECTED:
    "This employer decided to move forward with other candidates this time.",
  WITHDRAWN: "You withdrew this application.",
};

const formatSalary = (
  min: number | null,
  max: number | null,
  currency: string
): string | null => {
  if (!min && !max) return null;
  const fmt = (n: number) => `${currency} ${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max)!);
};

export const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const {
    data: application,
    isLoading,
    isError,
    refetch,
  } = useApplication(applicationId);
  const { data: interviewData } = useInterview(applicationId);
  const interview = interviewData?.interview ?? null;

  useDocumentTitle(
    application ? application.job.employer.companyName : "Application"
  );

  const salary = application
    ? formatSalary(
        application.job.salaryMin,
        application.job.salaryMax,
        application.job.currency
      )
    : null;

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <ApplicationDetailHeader
        backHref={ROUTES.talent}
        className="mb-6"
        icon={
          application && (
            <CompanyLogo
              name={application.job.employer.companyName}
              size={36}
            />
          )
        }
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
            <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <Badge
                  variant={
                    STATUS_BADGE[STATUS_TO_BUCKET[application.status]].variant
                  }
                >
                  {STATUS_BADGE[STATUS_TO_BUCKET[application.status]].label}
                </Badge>
                {salary && (
                  <span className="truncate text-[12px] text-neutral-400">
                    {salary} ·{" "}
                    {application.job.isRemote
                      ? "Remote"
                      : application.job.country}
                  </span>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-1.5"
                  )}
                  to={ROUTES.applicationMessages(application.id)}
                >
                  <MessageCircle size={14} /> Message
                </Link>
                {application.status === "INTERVIEW" && (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "gap-1.5"
                    )}
                    to={ROUTES.applicationInterview(application.id)}
                  >
                    <CalendarClock size={14} /> Interview
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-3 border-b border-neutral-100 p-5">
              {application.status === "INTERVIEW" ? (
                interview?.status === "CONFIRMED" &&
                !hasOccurred(interview.confirmedSlot) ? (
                  <UpcomingInterviewCard interview={interview} />
                ) : (
                  <p className="text-[13px] text-neutral-600">
                    {interview
                      ? "The employer proposed interview times — pick one to lock it in."
                      : "The employer will reach out to schedule an interview."}
                  </p>
                )
              ) : (
                STATUS_GUIDANCE[application.status] && (
                  <p className="text-[13px] text-neutral-600">
                    {STATUS_GUIDANCE[application.status]}
                  </p>
                )
              )}
            </div>

            <ApplicationTimeline application={application} />
          </>
        )}
      </div>
    </div>
  );
};
