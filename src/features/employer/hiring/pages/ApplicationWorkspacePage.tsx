import { Link, useParams } from "react-router-dom";
import { CalendarClock, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEmployerApplicationsAggregate } from "@/features/employer/employer.queries";
import { useInterview } from "@/features/interviews/interview.queries";
import { useScorecards } from "@/features/scorecards/scorecard.queries";
import { useTeamMembers } from "@/features/team/team.queries";
import { hasOccurred } from "@/features/interviews/interview.utils";
import {
  buildHiringPipeline,
  getPrimaryAction,
  stageBadgeVariant,
  stageLabel,
} from "@/features/employer/hiring/hiring-stage.utils";
import { Badge } from "@/components/ui/badge";
import { countEligibleReviewers } from "@/features/scorecards/scorecard.utils";
import { buildActivityEvents } from "@/features/employer/hiring/activity.utils";
import { HiringProgressStepper } from "@/features/employer/hiring/components/HiringProgressStepper";
import { CandidateSummaryCard } from "@/features/employer/hiring/components/CandidateSummaryCard";
import { HiringDecisionCard } from "@/features/employer/hiring/components/HiringDecisionCard";
import { ApplicationActivityTimeline } from "@/features/employer/hiring/components/ApplicationActivityTimeline";
import { UpcomingInterviewCard } from "@/features/interviews/components/UpcomingInterviewCard";
import { ScorecardSection } from "@/features/scorecards/components/ScorecardSection";
import { CvAnalysisCard } from "@/features/cv-analysis/components/CvAnalysisCard";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { useUpdateApplicationStatus } from "@/features/employer/employer.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

const WorkspaceSkeleton = () => (
  <div className="min-h-screen bg-[#F8F7F4]">
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <Skeleton className="mb-6 h-9 w-64" />
      <Skeleton className="mb-6 h-16 w-full rounded-16" />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-16" />
          <Skeleton className="h-32 w-full rounded-16" />
        </div>
        <Skeleton className="h-64 w-full rounded-16" />
      </div>
    </div>
  </div>
);

export const ApplicationWorkspacePage = () => {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const { user } = useAuth();

  const {
    applications,
    isLoading: applicantsLoading,
    isError: applicantsError,
    refetchAll,
  } = useEmployerApplicationsAggregate();
  const applicant = applications.find((a) => a.id === applicationId);

  const { data: interviewData, isLoading: interviewLoading } =
    useInterview(applicationId);
  const interview = interviewData?.interview ?? null;
  const occurred = hasOccurred(interview?.confirmedSlot ?? null);

  const { data: scorecardData } = useScorecards(applicationId);
  const { data: teamMembers } = useTeamMembers();

  const updateStatus = useUpdateApplicationStatus();
  const runWithToast = useToastMutation();

  useDocumentTitle(
    applicant
      ? `${applicant.talent.user.name ?? "Candidate"} — Hiring`
      : "Hiring"
  );

  if (applicantsLoading || interviewLoading) {
    return <WorkspaceSkeleton />;
  }

  if (applicantsError) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
        <div className="mx-auto max-w-[900px] px-6 py-10">
          <EmptyState
            action={
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => refetchAll()}
              >
                Try again
              </Button>
            }
            description="Something went wrong loading this candidate."
            title="Couldn't load this application"
          />
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
        <div className="mx-auto max-w-[900px] px-6 py-10">
          <EmptyState
            action={
              <Link
                className={buttonVariants({ variant: "outline", size: "sm" })}
                to={ROUTES.employerDashboard}
              >
                Back to dashboard
              </Link>
            }
            description="This application may have been withdrawn, or you don't have access to it."
            title="Application not found"
          />
        </div>
      </div>
    );
  }

  const talentName = applicant.talent.user.name ?? "Candidate";
  const eligibleReviewerCount = countEligibleReviewers(
    teamMembers ?? [],
    interview?.interviewerId
  );

  const pipeline = buildHiringPipeline(
    applicant.status,
    interview,
    !!scorecardData &&
      scorecardData.summary.total >= eligibleReviewerCount &&
      eligibleReviewerCount > 0
  );

  const viewerHasSubmittedScorecard =
    scorecardData?.scorecards.some((s) => s.authorId === user?.id) ?? false;

  const primaryAction = getPrimaryAction({
    status: applicant.status,
    interview,
    viewerHasSubmittedScorecard,
    scorecardSummary: scorecardData?.summary,
    eligibleReviewerCount,
  });

  const readyForDecision =
    applicant.status === "INTERVIEW" &&
    occurred &&
    !!scorecardData &&
    eligibleReviewerCount > 0 &&
    scorecardData.summary.total >= eligibleReviewerCount;

  const activityEvents = buildActivityEvents(
    applicant,
    interview,
    scorecardData?.scorecards ?? []
  );

  const handleAdvance = async (
    nextStatus: "REVIEWING" | "SHORTLISTED" | "INTERVIEW"
  ): Promise<void> => {
    await runWithToast(
      () =>
        updateStatus.mutateAsync({
          id: applicant.id,
          jobId: applicant.jobId,
          status: nextStatus,
        }),
      {
        success: "Application updated.",
        error: "Couldn't update the application. Please try again.",
      }
    );
  };
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="mx-auto max-w-[900px] px-6 py-10">
        <div className="mb-5 flex items-start justify-between gap-3">
          <ApplicationDetailHeader
            backHref={ROUTES.employerDashboard}
            subtitle={applicant.jobTitle}
            title={talentName}
          />
          <Badge
            className="mt-1.5 flex-shrink-0"
            variant={stageBadgeVariant(applicant.status, occurred)}
          >
            {stageLabel(applicant.status, occurred)}
          </Badge>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-16 border border-neutral-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <HiringProgressStepper pipeline={pipeline} />
          </div>
          {primaryAction && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5"
                )}
                to={ROUTES.applicationMessages(applicant.id)}
              >
                <MessageCircle size={14} /> Message
              </Link>
              {primaryAction.kind === "advance" ? (
                <ConfirmAction
                  confirmLabel="Confirm"
                  message={`${primaryAction.label}?`}
                  pendingLabel="Working…"
                  onConfirm={() =>
                    handleAdvance(
                      primaryAction.nextStatus as
                        "REVIEWING" | "SHORTLISTED" | "INTERVIEW"
                    )
                  }
                >
                  {({ onClick }) => (
                    <Button size="sm" type="button" onClick={onClick}>
                      {primaryAction.label}
                    </Button>
                  )}
                </ConfirmAction>
              ) : primaryAction.kind === "schedule-interview" ||
                primaryAction.kind === "view-interview" ? (
                <Link
                  className={buttonVariants({ size: "sm" })}
                  to={ROUTES.applicationInterview(applicant.id)}
                >
                  <CalendarClock size={14} /> {primaryAction.label}
                </Link>
              ) : (
                <a
                  className={buttonVariants({ size: "sm" })}
                  href="#team-feedback"
                >
                  {primaryAction.label}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <CvAnalysisCard
              applicationId={applicant.id}
              talentName={talentName}
            />

            {interview?.status === "CONFIRMED" && !occurred && (
              <UpcomingInterviewCard interview={interview} />
            )}

            <div id="team-feedback">
              <ScorecardSection
                applicationId={applicant.id}
                eligibleReviewerCount={eligibleReviewerCount}
                interviewOccurred={occurred}
                talentName={talentName}
              />
            </div>

            {readyForDecision && scorecardData && (
              <HiringDecisionCard
                applicationId={applicant.id}
                jobId={applicant.jobId}
                summary={scorecardData.summary}
                talentName={talentName}
              />
            )}

            <div className="lg:hidden">
              <CandidateSummaryCard applicant={applicant} />
            </div>

            <ApplicationActivityTimeline events={activityEvents} />
          </div>

          <div className="hidden rounded-16 border border-neutral-100 bg-white p-4 lg:block">
            <CandidateSummaryCard applicant={applicant} />
          </div>
        </div>
      </div>
    </div>
  );
};
