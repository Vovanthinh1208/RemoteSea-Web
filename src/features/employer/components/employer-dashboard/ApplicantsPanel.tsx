import { memo, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock3, MessageCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Dropdown } from "@/components/ui/dropdown";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { useToast } from "@/components/ui/toast";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import {
  useBulkUpdateApplicationStatus,
  useUpdateApplicationStatus,
} from "@/features/employer/employer.queries";
import { MatchBadge } from "@/features/matching/MatchBadge";
import { AvailabilityBadge } from "@/features/availability/AvailabilityBadge";
import {
  APPLICANT_STATUS,
  backlogDays,
  colorFor,
  NEXT_LABEL,
  NEXT_STAGE,
  timeAgo,
  type ApplicantStatusGroup,
} from "@/features/employer/employer-dashboard.utils";
import type { ApplicantWithJob } from "@/features/employer/employer.queries";
import type { ApplicationStatus } from "@/types/application";
import { personInitial } from "@/utils/name";

type ApplicantTabId = "all" | "new" | "shortlisted";

const isApplicantTabId = (v: string): v is ApplicantTabId =>
  (["all", "new", "shortlisted"] as const).includes(v as ApplicantTabId);

type ApplicantSortId = "recent" | "match";

const isApplicantSortId = (v: string): v is ApplicantSortId =>
  (["recent", "match"] as const).includes(v as ApplicantSortId);

const SORT_OPTIONS: { value: ApplicantSortId; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "match", label: "Best match" },
];

const RECENT_APPLICANTS_DISPLAY_COUNT = 8;

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

// The "archived" group covers both REJECTED and WITHDRAWN for tab-filtering
// purposes, but showing "Archived" on the row badge right after an employer
// clicks reject (with a toast that says "Applicant rejected") reads as if the
// action didn't register. The badge shows the real, specific status instead.
const APPLICANT_ROW_STATUS_LABEL: Partial<Record<ApplicationStatus, string>> = {
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

// Mirrors the backend's ALLOWED_TRANSITIONS (every status but REJECTED/
// WITHDRAWN can reach REJECTED) rather than the single-row UI's narrower
// "only if a next stage exists" gate — bulk-reject is a separate, more
// general mechanism, so an OFFERED row (which has no single-row reject
// button today) is still a valid bulk-reject candidate.
const isRejectable = (status: ApplicationStatus): boolean =>
  status !== "REJECTED" && status !== "WITHDRAWN";

interface ApplicantRowProps {
  applicant: ApplicantWithJob;
  isPending: boolean;
  onStatusChange: (
    id: string,
    jobId: string,
    status: ApplicationStatus
  ) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

const ApplicantRow = memo(function ApplicantRow({
  applicant: a,
  isPending,
  onStatusChange,
  selected,
  onToggleSelect,
}: ApplicantRowProps) {
  const name = a.talent.user.name ?? "Candidate";
  const initial = personInitial(name);
  const group = APPLICANT_STATUS[a.status];
  const nextStatus = NEXT_STAGE[a.status];
  const stuckDays = backlogDays(a.status, a.appliedAt, a.updatedAt);
  return (
    <div className="group flex items-center gap-3 rounded-12 px-2 py-3 transition-colors hover:bg-neutral-50">
      <input
        aria-label={`Select ${name}`}
        checked={selected}
        className="h-4 w-4 shrink-0 accent-brand-600 disabled:opacity-30"
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
        style={{ background: colorFor(name) }}
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[13.5px] font-medium text-neutral-900">
            {name}
          </span>
        </div>
        <div className="text-[11.5px] text-neutral-400">
          {a.talent.headline ?? a.talent.level}
          <span className="text-neutral-300"> · for {a.jobTitle}</span>
        </div>
      </div>

      {a.match && (
        <div className="flex-shrink-0">
          <MatchBadge match={a.match} />
        </div>
      )}

      <div className="flex-shrink-0">
        <AvailabilityBadge
          isOpenToWork={a.talent.isOpenToWork}
          noticePeriod={a.talent.noticePeriod}
        />
      </div>

      {stuckDays !== null && (
        <div
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
          title="Employer Response SLA — this is the same signal behind the reminder email"
        >
          <Clock3 size={10} /> {stuckDays}d, awaiting review
        </div>
      )}

      <div className="flex-shrink-0 text-right">
        <Badge
          className="px-1.5 py-0.5 text-[10px]"
          variant={APPLICANT_STATUS_VARIANT[group]}
        >
          {APPLICANT_ROW_STATUS_LABEL[a.status] ??
            APPLICANT_STATUS_LABEL[group]}
        </Badge>
      </div>

      <Link
        aria-label="Message applicant"
        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        to={ROUTES.applicationMessages(a.id)}
      >
        <MessageCircle size={13} />
      </Link>

      {nextStatus && a.status !== "REJECTED" ? (
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            className="inline-flex items-center gap-1 rounded-8 bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
            disabled={isPending}
            type="button"
            onClick={() => onStatusChange(a.id, a.jobId, nextStatus)}
          >
            <Check size={11} /> {NEXT_LABEL[a.status]}
          </button>
          <button
            aria-label="Reject applicant"
            className="grid h-7 w-7 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            disabled={isPending}
            type="button"
            onClick={() => onStatusChange(a.id, a.jobId, "REJECTED")}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex-shrink-0 text-[11px] text-neutral-400">
          {timeAgo(a.appliedAt)}
        </div>
      )}
    </div>
  );
});

interface ApplicantsPanelProps {
  applicants: ApplicantWithJob[];
}

export const ApplicantsPanel = ({ applicants }: ApplicantsPanelProps) => {
  const runWithToast = useToastMutation();
  const updateStatusMutation = useUpdateApplicationStatus();
  const bulkUpdateMutation = useBulkUpdateApplicationStatus();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // URL-synced so reloading (or sharing the link) doesn't silently revert to "All".
  const [tab, setTab] = useSearchParamState<ApplicantTabId>(
    "applicantTab",
    "all",
    isApplicantTabId
  );
  const [sort, setSort] = useSearchParamState<ApplicantSortId>(
    "applicantSort",
    "recent",
    isApplicantSortId
  );

  const tabs: { id: ApplicantTabId; label: string; count: number }[] = [
    { id: "all", label: "All", count: applicants.length },
    {
      id: "new",
      label: "New",
      count: applicants.filter((a) => APPLICANT_STATUS[a.status] === "new")
        .length,
    },
    {
      id: "shortlisted",
      label: "Shortlisted",
      count: applicants.filter(
        (a) => APPLICANT_STATUS[a.status] === "shortlisted"
      ).length,
    },
  ];
  const filtered =
    tab === "all"
      ? applicants
      : applicants.filter((a) => APPLICANT_STATUS[a.status] === tab);
  const list = useMemo(
    () =>
      sort === "match"
        ? [...filtered].sort(
            (a, b) => (b.match?.score ?? -1) - (a.match?.score ?? -1)
          )
        : [...filtered].sort(
            (a, b) =>
              new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
          ),
    [filtered, sort]
  );

  const { mutateAsync: updateStatus } = updateStatusMutation;
  const updateApplicantStatus = useCallback(
    (id: string, jobId: string, status: ApplicationStatus) =>
      runWithToast(() => updateStatus({ id, jobId, status }), {
        success:
          status === "REJECTED" ? "Applicant rejected" : "Applicant advanced",
        successVariant: status === "REJECTED" ? "info" : "success",
        error: "Couldn't update applicant",
      }),
    [updateStatus, runWithToast]
  );

  const visible = list.slice(0, RECENT_APPLICANTS_DISPLAY_COUNT);
  const eligibleVisible = visible.filter((a) => isRejectable(a.status));

  // A selection only makes sense against the currently-visible rows — switching
  // tabs changes what's shown, so stale ids pointing at rows that are no
  // longer there would leave the bulk bar showing a count nothing on screen
  // corresponds to. Reset during render (React's recommended pattern for
  // "adjust state when a prop changes"), not in an effect — an effect here
  // would commit one extra render with the stale selection still visible.
  const [prevTab, setPrevTab] = useState(tab);
  if (tab !== prevTab) {
    setPrevTab(tab);
    setSelectedIds(new Set());
  }

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allEligibleSelected =
    eligibleVisible.length > 0 &&
    eligibleVisible.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    setSelectedIds(
      allEligibleSelected
        ? new Set()
        : new Set(eligibleVisible.map((a) => a.id))
    );
  };

  const { mutateAsync: bulkUpdate } = bulkUpdateMutation;
  const { toast } = useToast();
  const selectedApplicants = visible.filter((a) => selectedIds.has(a.id));
  const bulkReject = async () => {
    const items = selectedApplicants.map((a) => ({ id: a.id, jobId: a.jobId }));
    try {
      // Backend always returns 200 with a per-id updated/failed split —
      // partial failure isn't an exception, so the message has to be built
      // from the response, not runWithToast's single static success string.
      const { updated, failed } = await bulkUpdate({
        items,
        status: "REJECTED",
      });
      toast({
        variant: failed.length > 0 ? "info" : "success",
        title:
          failed.length === 0
            ? `${updated.length} applicant${updated.length === 1 ? "" : "s"} rejected`
            : `${updated.length} rejected, ${failed.length} couldn't be updated`,
      });
      // Only clear on a real response (even a partial one) — a thrown error
      // (network failure, rate limit) means nothing was updated, so wiping
      // the selection here would force the user to re-pick everyone just to
      // retry the exact same batch.
      setSelectedIds(new Set());
    } catch {
      toast({ variant: "error", title: "Couldn't reject applicants" });
    }
  };

  return (
    <div className="rounded-20 border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-neutral-900">
          Recent applicants
        </h3>
        <div className="flex items-center gap-2">
          <Dropdown
            aria-label="Sort applicants"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(v) => setSort(v as ApplicantSortId)}
          />
          <div className="flex gap-0.5 rounded-8 border border-neutral-200 bg-neutral-50 p-0.5">
            {tabs.map((t) => (
              <button
                aria-pressed={tab === t.id}
                className={cn(
                  "rounded-6 px-2.5 py-1 text-[11.5px] font-medium transition-all",
                  tab === t.id
                    ? "bg-white text-neutral-900 shadow-chip"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <span
                  className={cn(
                    "ml-1 rounded-full px-1 py-0.5 text-[10px]",
                    tab === t.id
                      ? "bg-brand-100 text-brand-700"
                      : "bg-neutral-100 text-neutral-400"
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyRow>No applicants yet.</EmptyRow>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-2.5 px-2">
            <input
              aria-label="Select all eligible"
              checked={allEligibleSelected}
              className="h-4 w-4 shrink-0 accent-brand-600 disabled:opacity-30"
              disabled={eligibleVisible.length === 0}
              title="Selects every applicant not already rejected or withdrawn"
              type="checkbox"
              onChange={toggleSelectAll}
            />
            {selectedIds.size > 0 ? (
              <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] text-neutral-500">
                  {selectedIds.size} selected
                </span>
                <ConfirmAction
                  confirmLabel="Reject"
                  isPending={bulkUpdateMutation.isPending}
                  message={`Reject ${selectedIds.size} selected applicant${selectedIds.size === 1 ? "" : "s"}?`}
                  pendingLabel="Rejecting…"
                  onConfirm={bulkReject}
                >
                  {({ onClick }) => (
                    <button
                      className="inline-flex items-center gap-1 rounded-8 px-2.5 py-1 text-[11.5px] font-medium text-red-600 transition-colors hover:bg-red-50"
                      type="button"
                      onClick={onClick}
                    >
                      <X size={12} /> Reject selected
                    </button>
                  )}
                </ConfirmAction>
              </div>
            ) : (
              <span className="text-[12px] text-neutral-400">
                Select to reject in bulk
              </span>
            )}
          </div>

          <div className="divide-y divide-neutral-50">
            {visible.map((a) => (
              <ApplicantRow
                applicant={a}
                // Scoped to this row's id for the single-item mutation —
                // otherwise updating one applicant disables the action
                // buttons on every other row too. bulkUpdateMutation is
                // OR'd in unscoped: while a bulk write is in flight, every
                // row pauses, since a concurrent single-item PATCH against
                // a row the bulk call is also touching would race the same
                // CAS the backend uses (harmless — one side just loses and
                // reports stale — but confusing to trigger from the UI).
                isPending={
                  (updateStatusMutation.isPending &&
                    updateStatusMutation.variables?.id === a.id) ||
                  bulkUpdateMutation.isPending
                }
                key={a.id}
                selected={selectedIds.has(a.id)}
                onStatusChange={updateApplicantStatus}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
