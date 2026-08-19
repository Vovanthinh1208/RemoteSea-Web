import { useParams } from "react-router-dom";
import { useInterview } from "@/features/interviews/interview.queries";
import { ProposeInterviewForm } from "@/features/interviews/components/ProposeInterviewForm";
import { ConfirmInterviewForm } from "@/features/interviews/components/ConfirmInterviewForm";
import { UpcomingInterviewCard } from "@/features/interviews/components/UpcomingInterviewCard";
import { ReviewCTA } from "@/features/reviews/components/ReviewCTA";
import { ScorecardSection } from "@/features/scorecards/components/ScorecardSection";
import { hasOccurred } from "@/features/interviews/interview.utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { useApplicationHeaderContext } from "@/hooks/useApplicationHeaderContext";

export const InterviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const { data, isLoading, isError, refetch } = useInterview(applicationId);
  const { isEmployerViewer, backHref, title } = useApplicationHeaderContext(
    data,
    "Interview"
  );

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <ApplicationDetailHeader
        backHref={backHref}
        className="mb-6"
        subtitle={data?.jobTitle}
        title={title}
      />

      <div className="rounded-16 border border-neutral-100 bg-white p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <EmptyState
            action={
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
            description="Something went wrong loading this interview."
            title="Couldn't load interview details"
          />
        ) : !data?.interview ? (
          isEmployerViewer ? (
            <ProposeInterviewForm
              applicationId={applicationId}
              existing={null}
            />
          ) : (
            <EmptyState
              description="Waiting for the employer to propose interview times."
              title="No interview scheduled yet"
            />
          )
        ) : data.interview.status === "CONFIRMED" ? (
          <div className="space-y-4">
            <UpcomingInterviewCard interview={data.interview} />
            {isEmployerViewer && (
              <ScorecardSection
                applicationId={applicationId}
                interviewOccurred={hasOccurred(data.interview.confirmedSlot)}
                talentName={data.talentName ?? "the candidate"}
              />
            )}
            <ReviewCTA
              applicationId={applicationId}
              revieweeName={
                (isEmployerViewer ? data.talentName : data.employerName) ??
                (isEmployerViewer ? "the candidate" : "the employer")
              }
            />
          </div>
        ) : isEmployerViewer ? (
          <div className="space-y-5">
            <div className="rounded-10 border border-amber-200 bg-amber-50 p-3.5 text-[12.5px] text-amber-700">
              Waiting on the candidate to confirm one of these times. You can
              still revise them below.
            </div>
            <ProposeInterviewForm
              applicationId={applicationId}
              existing={data.interview}
            />
          </div>
        ) : (
          <ConfirmInterviewForm
            applicationId={applicationId}
            interview={data.interview}
          />
        )}
      </div>
    </div>
  );
};
