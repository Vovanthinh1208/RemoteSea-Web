import { useParams } from "react-router-dom";
import {
  useCancelInterview,
  useInterview,
} from "@/features/interviews/interview.queries";
import { ProposeInterviewForm } from "@/features/interviews/components/ProposeInterviewForm";
import { ConfirmInterviewForm } from "@/features/interviews/components/ConfirmInterviewForm";
import { UpcomingInterviewCard } from "@/features/interviews/components/UpcomingInterviewCard";
import { ReviewCTA } from "@/features/reviews/components/ReviewCTA";
import { ScorecardSection } from "@/features/scorecards/components/ScorecardSection";
import { hasOccurred } from "@/features/interviews/interview.utils";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { useApplicationHeaderContext } from "@/hooks/useApplicationHeaderContext";
import { useToastMutation } from "@/hooks/useToastMutation";

export const InterviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const { data, isLoading, isError, refetch } = useInterview(applicationId);
  const { isEmployerViewer, backHref, title } = useApplicationHeaderContext(
    data,
    "Interview"
  );
  const cancelMutation = useCancelInterview(applicationId);
  const runWithToast = useToastMutation();

  const handleCancel = async (): Promise<void> => {
    await runWithToast(() => cancelMutation.mutateAsync(), {
      success: "Interview cancelled.",
      error: "Couldn't cancel the interview. Please try again.",
    });
  };

  const cancelInterviewAction = (
    <ConfirmAction
      confirmLabel="Cancel interview"
      isPending={cancelMutation.isPending}
      message="Cancel this interview?"
      pendingLabel="Cancelling…"
      onConfirm={handleCancel}
    >
      {({ onClick }) => (
        <Button size="sm" type="button" variant="outline" onClick={onClick}>
          Cancel interview
        </Button>
      )}
    </ConfirmAction>
  );

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <ApplicationDetailHeader
        backHref={backHref}
        className="mb-6"
        subtitle={data?.jobTitle}
        title={title}
      />

      {/* The CONFIRMED branch below deliberately does NOT get this
          card wrapper — UpcomingInterviewCard/ScorecardSection/ReviewCTA
          are each already their own full bordered card, so wrapping them
          in one more wasn't extra grouping, just a fourth stacked frame.
          Every other branch here renders plain content (a form, a status
          message, a loading/error placeholder) that still benefits from
          one page-level card, so each keeps its own copy of the wrapper
          rather than sharing a new component just for this. */}
      {isLoading ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-3 h-9 w-32 rounded-8" />
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          <EmptyState
            action={
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
            description="Something went wrong loading this interview."
            title="Couldn't load interview details"
          />
        </div>
      ) : !data?.interview ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          {isEmployerViewer ? (
            <ProposeInterviewForm
              applicationId={applicationId}
              existing={null}
            />
          ) : (
            <EmptyState
              description="Waiting for the employer to propose interview times."
              title="No interview scheduled yet"
            />
          )}
        </div>
      ) : data.interview.status === "CONFIRMED" ? (
        <div className="space-y-4">
          <UpcomingInterviewCard interview={data.interview} />
          {isEmployerViewer && !hasOccurred(data.interview.confirmedSlot) && (
            <div className="flex justify-end">{cancelInterviewAction}</div>
          )}
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
      ) : data.interview.status === "CANCELLED" ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          {isEmployerViewer ? (
            <div className="space-y-5">
              <div className="rounded-10 border border-neutral-200 bg-neutral-50 p-3.5 text-[12.5px] text-neutral-600">
                This interview was cancelled. Propose new times below to
                reschedule.
              </div>
              <ProposeInterviewForm
                applicationId={applicationId}
                existing={null}
              />
            </div>
          ) : (
            <EmptyState
              description="The employer cancelled this interview."
              title="Interview cancelled"
            />
          )}
        </div>
      ) : isEmployerViewer ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          <div className="space-y-5">
            <div className="rounded-10 border border-amber-200 bg-amber-50 p-3.5 text-[12.5px] text-amber-700">
              Waiting on the candidate to confirm one of these times. You can
              still revise them below.
            </div>
            <ProposeInterviewForm
              applicationId={applicationId}
              existing={data.interview}
            />
            <div className="flex justify-end">{cancelInterviewAction}</div>
          </div>
        </div>
      ) : (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          <ConfirmInterviewForm
            applicationId={applicationId}
            interview={data.interview}
          />
        </div>
      )}
    </div>
  );
};
