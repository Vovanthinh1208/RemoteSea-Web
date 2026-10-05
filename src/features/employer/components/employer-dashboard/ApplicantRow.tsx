import { memo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock3,
  Paperclip,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { MatchBadge } from "@/features/matching/MatchBadge";
import { AvailabilityBadge } from "@/features/availability/AvailabilityBadge";
import {
  APPLICANT_STATUS,
  backlogDays,
  colorFor,
  isRejectable,
  NEXT_LABEL,
  NEXT_STAGE,
  timeAgo,
  type ApplicantStatusGroup,
} from "@/features/employer/employer-dashboard.utils";
import type { ApplicantHiringSignal } from "@/features/employer/hiring/applicant-signals.queries";
import { getPrimaryAction } from "@/features/employer/hiring/hiring-stage.utils";
import { formatSlot, hasOccurred } from "@/features/interviews/interview.utils";
import type { ApplicantWithJob } from "@/features/employer/employer.queries";
import type { ApplicationStatus } from "@/types/application";
import { personInitial } from "@/utils/name";

const APPLICANT_STATUS_VARIANT: Record<ApplicantStatusGroup, BadgeVariant> = {
  new: "info",
  reviewing: "positive",
  shortlisted: "success",
  archived: "muted",
};

const APPLICANT_STATUS_LABEL: Record<ApplicantStatusGroup, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  archived: "Archived",
};

const APPLICANT_ROW_STATUS_LABEL: Partial<Record<ApplicationStatus, string>> = {
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export interface ApplicantRowProps {
  applicant: ApplicantWithJob;
  isPending: boolean;
  onStatusChange: (
    id: string,
    jobId: string,
    status: ApplicationStatus
  ) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  signal: ApplicantHiringSignal | undefined;
  currentUserId: string | undefined;
}

export const ApplicantRow = memo(function ApplicantRow({
  applicant: a,
  isPending,
  onStatusChange,
  selected,
  onToggleSelect,
  signal,
  currentUserId,
}: ApplicantRowProps) {
  const name = a.talent.user.name ?? "Candidate";
  const initial = personInitial(name);
  const group = APPLICANT_STATUS[a.status];
  const nextStatus = NEXT_STAGE[a.status];
  const stuckDays = backlogDays(a.status, a.appliedAt, a.updatedAt);
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const interviewOccurred = hasOccurred(
    signal?.interview?.confirmedSlot ?? null
  );
  const nextLine =
    a.status === "INTERVIEW" && signal
      ? signal.interview?.status === "CONFIRMED" &&
        signal.interview.confirmedSlot &&
        !interviewOccurred
        ? { icon: Calendar, text: formatSlot(signal.interview.confirmedSlot) }
        : signal.scorecardSummary && signal.scorecardSummary.total > 0
          ? {
              icon: Users,
              text: `${signal.scorecardSummary.hireCount}/${signal.scorecardSummary.total} recommend hire`,
            }
          : null
      : null;

  const interviewStageAction =
    a.status === "INTERVIEW" && signal
      ? getPrimaryAction({
          status: a.status,
          interview: signal.interview,
          viewerHasSubmittedScorecard: signal.scorecards.some(
            (s) => s.authorId === currentUserId
          ),
          scorecardSummary: signal.scorecardSummary,
          eligibleReviewerCount: signal.eligibleReviewerCount,
        })
      : null;
  const interviewStageActionHref =
    interviewStageAction?.kind === "schedule-interview" ||
    interviewStageAction?.kind === "view-interview"
      ? ROUTES.applicationInterview(a.id)
      : ROUTES.employerApplicationDetail(a.id);

  const actionGroup =
    a.status === "INTERVIEW" ? (
      <div className="flex flex-shrink-0 items-center gap-1">
        {interviewStageAction ? (
          <Link
            className="inline-flex items-center gap-1 rounded-8 bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-100 focus-visible:shadow-focus focus-visible:outline-none"
            to={interviewStageActionHref}
          >
            {interviewStageAction.label}
          </Link>
        ) : (
          <span className="h-7 w-20 animate-pulse rounded-8 bg-neutral-100" />
        )}
        <ConfirmAction
          confirmLabel="Reject"
          isPending={isPending}
          message="Reject this applicant?"
          pendingLabel="Rejecting…"
          onConfirm={() => onStatusChange(a.id, a.jobId, "REJECTED")}
        >
          {({ onClick }) => (
            <button
              aria-label="Reject applicant"
              className="grid h-7 w-7 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
              disabled={isPending}
              type="button"
              onClick={onClick}
            >
              <X size={13} />
            </button>
          )}
        </ConfirmAction>
      </div>
    ) : nextStatus && a.status !== "REJECTED" ? (
      <div className="flex flex-shrink-0 items-center gap-1">
        <ConfirmAction
          confirmLabel={NEXT_LABEL[a.status]}
          isPending={isPending}
          message={`${NEXT_LABEL[a.status]} this applicant?`}
          pendingLabel="Updating…"
          onConfirm={() => onStatusChange(a.id, a.jobId, nextStatus)}
        >
          {({ onClick }) => (
            <button
              className="inline-flex items-center gap-1 rounded-8 bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-100 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
              disabled={isPending}
              type="button"
              onClick={onClick}
            >
              <Check size={11} /> {NEXT_LABEL[a.status]}
            </button>
          )}
        </ConfirmAction>
        <ConfirmAction
          confirmLabel="Reject"
          isPending={isPending}
          message="Reject this applicant?"
          pendingLabel="Rejecting…"
          onConfirm={() => onStatusChange(a.id, a.jobId, "REJECTED")}
        >
          {({ onClick }) => (
            <button
              aria-label="Reject applicant"
              className="grid h-7 w-7 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-50"
              disabled={isPending}
              type="button"
              onClick={onClick}
            >
              <X size={13} />
            </button>
          )}
        </ConfirmAction>
      </div>
    ) : (
      <div className="flex-shrink-0 text-[11px] text-neutral-400">
        {timeAgo(a.appliedAt)}
      </div>
    );

  return (
    <div className="group rounded-12 px-2 py-3 transition-colors hover:bg-neutral-50">
      <div className="flex items-start gap-3">
        <input
          aria-label={`Select ${name}`}
          checked={selected}
          className="mt-2 h-4 w-4 shrink-0 accent-brand-600 disabled:opacity-30"
          disabled={!isRejectable(a.status) || isPending}
          title={
            isRejectable(a.status)
              ? undefined
              : `Already ${(APPLICANT_ROW_STATUS_LABEL[a.status] ?? a.status).toLowerCase()}`
          }
          type="checkbox"
          onChange={() => onToggleSelect(a.id)}
        />
        <div
          className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
          style={{
            background: colorFor(name),
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
          }}
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link
              className="min-w-0 flex-1 truncate rounded-4 text-[13.5px] font-medium text-neutral-900 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.employerApplicationDetail(a.id)}
            >
              {name}
            </Link>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <Badge
                className="px-1.5 py-0.5 text-[10px]"
                variant={APPLICANT_STATUS_VARIANT[group]}
              >
                {APPLICANT_ROW_STATUS_LABEL[a.status] ??
                  APPLICANT_STATUS_LABEL[group]}
              </Badge>
              {a.resumeUrl && (
                <a
                  aria-label="View resume"
                  className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
                  href={a.resumeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Paperclip size={13} />
                </a>
              )}
              {actionGroup}
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              className="rounded-4 text-[11.5px] text-neutral-400 hover:text-neutral-600 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.employerApplicationDetail(a.id)}
            >
              {a.talent.headline ?? a.talent.level}
              <span className="text-neutral-300"> · for {a.jobTitle}</span>
            </Link>
            {a.match && <MatchBadge match={a.match} />}
            <AvailabilityBadge
              isOpenToWork={a.talent.isOpenToWork}
              noticePeriod={a.talent.noticePeriod}
            />
            {stuckDays !== null && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                title="Employer Response SLA — this is the same signal behind the reminder email"
              >
                <Clock3 size={10} /> {stuckDays}d, awaiting review
              </span>
            )}
          </div>

          {nextLine && (
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-brand-700">
              <nextLine.icon size={11} />
              {nextLine.text}
            </div>
          )}

          {a.coverLetter && (
            <button
              className="mt-1.5 inline-flex items-center gap-0.5 rounded-4 text-[11px] text-neutral-400 transition-colors hover:text-neutral-600 focus-visible:shadow-focus focus-visible:outline-none"
              type="button"
              onClick={() => setShowCoverLetter((v) => !v)}
            >
              {showCoverLetter ? "Hide cover letter" : "View cover letter"}
              <ChevronDown
                className={cn(
                  "transition-transform",
                  showCoverLetter && "rotate-180"
                )}
                size={12}
              />
            </button>
          )}
          {showCoverLetter && a.coverLetter && (
            <p className="mt-1.5 whitespace-pre-wrap rounded-8 border-l-2 border-neutral-200 bg-neutral-50 py-2 pl-3 pr-2.5 text-[12.5px] leading-relaxed text-neutral-600">
              &ldquo;{a.coverLetter}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
