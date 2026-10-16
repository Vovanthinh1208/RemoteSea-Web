import { Link, useParams } from "react-router-dom";
import { CalendarClock, MessageCircle, X } from "lucide-react";
import {
  useApplication,
  useRespondToOffer,
  useWithdrawApplication,
} from "@/features/applications/applications.queries";
import { useInterview } from "@/features/interviews/interview.queries";
import { hasOccurred } from "@/features/interviews/interview.utils";
import { UpcomingInterviewCard } from "@/features/interviews/components/UpcomingInterviewCard";
import { ApplicationTimeline } from "@/features/talent/components/talent-dashboard/ApplicationTimeline";
import {
  STATUS_BADGE,
  STATUS_TO_BUCKET,
} from "@/features/talent/talent-dashboard.utils";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToastMutation } from "@/hooks/useToastMutation";
import { cn } from "@/utils/cn";
import { formatSalaryWithCurrency } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import type { ApplicationStatus } from "@/types/application";
import { useTranslation } from "@/i18n/useTranslation";

// Mirrors the backend's WITHDRAWABLE_STATUSES (applications/constants.ts) —
// OFFERED is deliberately excluded, since the talent's response to an
// extended offer is accept/decline (see the OFFERED branch below), not
// withdraw; REJECTED/WITHDRAWN/OFFER_ACCEPTED/OFFER_DECLINED are terminal.
const WITHDRAWABLE_STATUSES: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
];

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
const GUIDED_STATUSES: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "OFFERED",
  "OFFER_ACCEPTED",
  "OFFER_DECLINED",
  "REJECTED",
  "WITHDRAWN",
];

export const ApplicationDetailPage = () => {
  const { t } = useTranslation("talent");
  const { id } = useParams<{ id: string }>();
  const applicationId = id ?? "";
  const {
    data: application,
    isLoading,
    isError,
    refetch,
  } = useApplication(applicationId);
  const { data: interviewData, isLoading: interviewLoading } =
    useInterview(applicationId);
  const interview = interviewData?.interview ?? null;

  const withdrawMutation = useWithdrawApplication();
  const offerResponseMutation = useRespondToOffer();
  const runWithToast = useToastMutation();

  const handleWithdraw = async (): Promise<void> => {
    await runWithToast(() => withdrawMutation.mutateAsync(applicationId), {
      success: t("appDetail.withdrawn"),
      error: t("appDetail.withdrawFailed"),
    });
  };

  const handleOfferResponse = async (
    response: "ACCEPTED" | "DECLINED"
  ): Promise<void> => {
    await runWithToast(
      () => offerResponseMutation.mutateAsync({ id: applicationId, response }),
      {
        success:
          response === "ACCEPTED"
            ? t("appDetail.offerAccepted")
            : t("appDetail.offerDeclined"),
        error: t("appDetail.offerFailed"),
      }
    );
  };

  useDocumentTitle(
    application
      ? application.job.employer.companyName
      : t("appDetail.fallbackTitle")
  );

  const salary = application
    ? formatSalaryWithCurrency(
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
          application
            ? application.job.employer.companyName
            : t("appDetail.fallbackTitle")
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
                  {t("common.actions.retry")}
                </Button>
              }
              description={t("appDetail.loadErrorDesc")}
              title={t("appDetail.loadError")}
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
                      ? t("snapshot.remote")
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
                  <MessageCircle size={14} /> {t("appDetail.message")}
                </Link>
                {application.status === "INTERVIEW" && (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "gap-1.5"
                    )}
                    to={ROUTES.applicationInterview(application.id)}
                  >
                    <CalendarClock size={14} /> {t("appDetail.interview")}
                  </Link>
                )}
                {WITHDRAWABLE_STATUSES.includes(application.status) && (
                  <ConfirmAction
                    confirmLabel={t("appDetail.withdrawLabel")}
                    isPending={withdrawMutation.isPending}
                    message={t("appDetail.withdrawQ")}
                    pendingLabel={t("appDetail.withdrawing")}
                    onConfirm={handleWithdraw}
                  >
                    {({ onClick }) => (
                      <button
                        className="grid h-8 w-8 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none"
                        title={t("appDetail.withdrawTitle")}
                        type="button"
                        onClick={onClick}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </ConfirmAction>
                )}
              </div>
            </div>

            <div className="space-y-3 border-b border-neutral-100 p-5">
              {application.status === "INTERVIEW" ? (
                interviewLoading ? (
                  <Skeleton className="h-4 w-64" />
                ) : interview?.status === "CONFIRMED" &&
                  !hasOccurred(interview.confirmedSlot) ? (
                  <UpcomingInterviewCard
                    applicationId={applicationId}
                    interview={interview}
                  />
                ) : (
                  <p className="text-[13px] text-neutral-600">
                    {interview
                      ? t("appDetail.interviewProposed")
                      : t("appDetail.interviewWaiting")}
                  </p>
                )
              ) : (
                GUIDED_STATUSES.includes(application.status) && (
                  <p className="text-[13px] text-neutral-600">
                    {t(`guidance.${application.status}`)}
                  </p>
                )
              )}
              {application.status === "OFFERED" && (
                <div className="flex gap-2">
                  <ConfirmAction
                    confirmLabel={t("appDetail.accept")}
                    isPending={offerResponseMutation.isPending}
                    message={t("appDetail.acceptQ")}
                    pendingLabel={t("appDetail.accepting")}
                    onConfirm={() => handleOfferResponse("ACCEPTED")}
                  >
                    {({ onClick }) => (
                      <Button size="sm" type="button" onClick={onClick}>
                        {t("appDetail.acceptOffer")}
                      </Button>
                    )}
                  </ConfirmAction>
                  <ConfirmAction
                    confirmLabel={t("appDetail.decline")}
                    isPending={offerResponseMutation.isPending}
                    message={t("appDetail.declineQ")}
                    pendingLabel={t("appDetail.declining")}
                    onConfirm={() => handleOfferResponse("DECLINED")}
                  >
                    {({ onClick }) => (
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={onClick}
                      >
                        {t("appDetail.declineOffer")}
                      </Button>
                    )}
                  </ConfirmAction>
                </div>
              )}
            </div>

            <ApplicationTimeline application={application} />
          </>
        )}
      </div>
    </div>
  );
};
