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
import { useTranslation } from "@/i18n/useTranslation";

// Same minimum as the API's cancelInterviewSchema.
const CANCEL_REASON_MIN_LENGTH = 5;

const CancelReason = ({ reason }: { reason: string | null }) => {
  const { t } = useTranslation("interviews");
  if (!reason) return null;
  return (
    <p className="mt-2 text-[12.5px] text-neutral-600">
      <span className="font-medium text-neutral-700">
        {t("page.cancelReasonLabel")}
      </span>{" "}
      {reason}
    </p>
  );
};

export const InterviewPage = () => {
  const { t } = useTranslation("interviews");
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const { data, isLoading, isError, refetch } = useInterview(applicationId);
  const { isEmployerViewer, backHref, title } = useApplicationHeaderContext(
    data,
    t("page.fallbackTitle")
  );
  const cancelMutation = useCancelInterview(applicationId);
  const runWithToast = useToastMutation();

  // PB62 AC2–3: the reason typed into the confirm step goes to the talent.
  const handleCancel = async (reason?: string): Promise<void> => {
    if (!reason) return;
    await runWithToast(() => cancelMutation.mutateAsync(reason), {
      success: t("page.cancelled"),
      error: t("page.cancelFailed"),
    });
  };

  const cancelInterviewAction = (
    <ConfirmAction
      confirmLabel={t("page.confirmCancel")}
      isPending={cancelMutation.isPending}
      message={t("page.cancelQ")}
      noteLabel={t("page.cancelReason")}
      noteMinLength={CANCEL_REASON_MIN_LENGTH}
      notePlaceholder={t("page.cancelReasonPlaceholder")}
      pendingLabel={t("page.cancelling")}
      onConfirm={handleCancel}
    >
      {({ onClick }) => (
        <Button size="sm" type="button" variant="outline" onClick={onClick}>
          {t("page.cancel")}
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
                {t("common.actions.retry")}
              </Button>
            }
            description={t("page.errorDesc")}
            title={t("page.errorTitle")}
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
              description={t("page.noneDesc")}
              title={t("page.noneTitle")}
            />
          )}
        </div>
      ) : data.interview.status === "CONFIRMED" ? (
        <div className="space-y-4">
          <UpcomingInterviewCard
            applicationId={applicationId}
            interview={data.interview}
          />
          {isEmployerViewer && !hasOccurred(data.interview.confirmedSlot) && (
            <div className="flex justify-end">{cancelInterviewAction}</div>
          )}
          {isEmployerViewer && (
            <ScorecardSection
              applicationId={applicationId}
              interviewOccurred={hasOccurred(data.interview.confirmedSlot)}
              talentName={data.talentName ?? t("page.theCandidate")}
            />
          )}
          <ReviewCTA
            applicationId={applicationId}
            revieweeName={
              (isEmployerViewer ? data.talentName : data.employerName) ??
              (isEmployerViewer
                ? t("page.theCandidate")
                : t("page.theEmployer"))
            }
          />
        </div>
      ) : data.interview.status === "CANCELLED" ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          {isEmployerViewer ? (
            <div className="space-y-5">
              <div className="rounded-10 border border-neutral-200 bg-neutral-50 p-3.5 text-[12.5px] text-neutral-600">
                {t("page.cancelledNote")}
                <CancelReason reason={data.interview.cancelReason} />
              </div>
              <ProposeInterviewForm
                applicationId={applicationId}
                existing={null}
              />
            </div>
          ) : (
            <>
              <EmptyState
                description={t("page.cancelledDesc")}
                title={t("page.cancelledTitle")}
              />
              <div className="text-center">
                <CancelReason reason={data.interview.cancelReason} />
              </div>
            </>
          )}
        </div>
      ) : isEmployerViewer ? (
        <div className="rounded-16 border border-neutral-100 bg-white p-5">
          <div className="space-y-5">
            <div className="rounded-10 border border-amber-200 bg-amber-50 p-3.5 text-[12.5px] text-amber-700">
              {t("page.waiting")}
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
