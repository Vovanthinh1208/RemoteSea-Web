import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { useToast } from "@/components/ui/toast";
import { useToastMutation } from "@/hooks/useToastMutation";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import {
  useBulkUpdateApplicationStatus,
  useUpdateApplicationStatus,
  type ApplicantWithJob,
} from "@/features/employer/employer.queries";
import {
  APPLICANT_STATUS,
  applicantsEmptyMessage,
  INITIAL_VISIBLE_APPLICANTS,
  isApplicantSortId,
  isApplicantTabId,
  isRejectable,
  MAX_VISIBLE_APPLICANTS,
  NEXT_STAGE,
  type ApplicantSortId,
  type ApplicantTabId,
} from "@/features/employer/employer-dashboard.utils";
import { useApplicantHiringSignals } from "@/features/employer/hiring/applicant-signals.queries";
import type { ApplicationStatus } from "@/types/application";
import { ApplicantFilters } from "./ApplicantFilters";
import { ApplicantBulkActions } from "./ApplicantBulkActions";
import { ApplicantRow } from "./ApplicantRow";

const TAB_LABEL: Record<ApplicantTabId, string | null> = {
  all: null,
  new: "New",
  shortlisted: "Shortlisted",
};

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

  const tabs = [
    { id: "all" as const, label: "All", count: applicants.length },
    {
      id: "new" as const,
      label: "New",
      count: applicants.filter((a) => APPLICANT_STATUS[a.status] === "new")
        .length,
    },
    {
      id: "shortlisted" as const,
      label: "Shortlisted",
      count: applicants.filter(
        (a) => APPLICANT_STATUS[a.status] === "shortlisted"
      ).length,
    },
  ];

  // Memoized on its own, not just inline above the `list` useMemo below —
  // an inline `.filter()` here produced a fresh array every render even
  // when `applicants`/`tab` hadn't changed, which meant `list`'s own
  // useMemo (keyed on `filtered`) never actually skipped the sort, and
  // that unstable `visible` array cascaded into useApplicantHiringSignals'
  // own internal memoization too.
  const filtered = useMemo(
    () =>
      tab === "all"
        ? applicants
        : applicants.filter((a) => APPLICANT_STATUS[a.status] === tab),
    [applicants, tab]
  );
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

  // How many of `list` are actually rendered — starts small (a fast,
  // compact first paint) and grows via the "Show all" control below.
  // Everything past this is already in memory (useEmployerDashboard already
  // fetched the whole company-wide recent-applications feed), so widening
  // it costs zero extra requests. Capped at MAX_VISIBLE_APPLICANTS, not
  // list.length — see that constant's own comment for why.
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_APPLICANTS);

  // Memoized for the same reason `filtered` above is: `.slice()` on an
  // unchanged `list` still returns a new array every render, and that
  // unstable reference was passed straight into useApplicantHiringSignals,
  // whose own useMemo (keyed on this array) never got to skip work.
  const visible = useMemo(
    () => list.slice(0, visibleCount),
    [list, visibleCount]
  );
  const eligibleVisible = useMemo(
    () => visible.filter((a) => isRejectable(a.status)),
    [visible]
  );
  // Next reveal target for "Show all" below — capped the same way `visible`
  // itself is, so the button never promises more than one click can deliver.
  const nextVisibleCount = Math.min(list.length, MAX_VISIBLE_APPLICANTS);
  const hasMoreToShow = visible.length < nextVisibleCount;
  const hiringSignals = useApplicantHiringSignals(visible);
  const { user } = useAuth();

  // A selection only makes sense against the currently-visible rows — switching
  // tabs changes what's shown, so stale ids pointing at rows that are no
  // longer there would leave the bulk bar showing a count nothing on screen
  // corresponds to. Reset during render (React's recommended pattern for
  // "adjust state when a prop changes"), not in an effect — an effect here
  // would commit one extra render with the stale selection still visible.
  // visibleCount resets alongside it — a "Show all" click while on one tab
  // shouldn't carry over as an already-expanded list on the next tab.
  const [prevTab, setPrevTab] = useState(tab);
  if (tab !== prevTab) {
    setPrevTab(tab);
    setSelectedIds(new Set());
    setVisibleCount(INITIAL_VISIBLE_APPLICANTS);
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

  const commonStatus =
    selectedApplicants.length > 0 &&
    selectedApplicants.every((a) => a.status === selectedApplicants[0].status)
      ? selectedApplicants[0].status
      : null;
  const bulkNextStatus = commonStatus ? NEXT_STAGE[commonStatus] : undefined;

  const runBulkUpdate = async (status: ApplicationStatus, notes?: string) => {
    const items = selectedApplicants.map((a) => ({ id: a.id, jobId: a.jobId }));
    const verb = status === "REJECTED" ? "rejected" : "advanced";
    try {
      // Backend always returns 200 with a per-id updated/failed split —
      // partial failure isn't an exception, so the message has to be built
      // from the response, not runWithToast's single static success string.
      const { updated, failed } = await bulkUpdate({ items, status, notes });
      toast({
        variant: failed.length > 0 ? "info" : "success",
        title:
          failed.length === 0
            ? `${updated.length} applicant${updated.length === 1 ? "" : "s"} ${verb}`
            : `${updated.length} ${verb}, ${failed.length} couldn't be updated`,
      });
      // Only clear on a real response (even a partial one) — a thrown error
      // (network failure, rate limit) means nothing was updated, so wiping
      // the selection here would force the user to re-pick everyone just to
      // retry the exact same batch.
      setSelectedIds(new Set());
    } catch {
      toast({
        variant: "error",
        title: `Couldn't ${status === "REJECTED" ? "reject" : "advance"} applicants`,
      });
    }
  };

  // rounded-16, not rounded-20 — matches EmployerDashboardSkeleton's
  // placeholder for this exact panel (same fix as ListingsPanel.tsx); was
  // rounded-20 on the real card, so the corner radius visibly snapped the
  // instant real data loaded.
  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-5">
      <ApplicantFilters
        sort={sort}
        tab={tab}
        tabs={tabs}
        onSortChange={setSort}
        onTabChange={setTab}
      />

      {list.length === 0 ? (
        <EmptyRow>
          {applicantsEmptyMessage(TAB_LABEL[tab])}
          {tab !== "all" && applicants.length > 0 && (
            <>
              {" "}
              <button
                className="rounded-4 font-medium text-brand-600 hover:text-brand-700 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={() => setTab("all")}
              >
                View all applicants
              </button>
            </>
          )}
        </EmptyRow>
      ) : (
        <>
          <ApplicantBulkActions
            allEligibleSelected={allEligibleSelected}
            bulkNextStatus={bulkNextStatus}
            commonStatus={commonStatus}
            eligibleCount={eligibleVisible.length}
            isPending={bulkUpdateMutation.isPending}
            selectedCount={selectedIds.size}
            onBulkUpdate={runBulkUpdate}
            onToggleSelectAll={toggleSelectAll}
          />

          <div className="divide-y divide-neutral-50">
            {visible.map((a) => (
              <ApplicantRow
                applicant={a}
                currentUserId={user?.id}
                isPending={
                  (updateStatusMutation.isPending &&
                    updateStatusMutation.variables?.id === a.id) ||
                  bulkUpdateMutation.isPending
                }
                key={a.id}
                selected={selectedIds.has(a.id)}
                signal={hiringSignals.get(a.id)}
                onStatusChange={updateApplicantStatus}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>

          {hasMoreToShow && (
            <div className="mt-1 flex items-center justify-center border-t border-neutral-50 pt-3">
              <button
                className="rounded-8 px-3 py-1.5 text-[12px] font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={() => setVisibleCount(nextVisibleCount)}
              >
                {nextVisibleCount === list.length
                  ? `Show all ${list.length} applicants`
                  : `Show ${nextVisibleCount} of ${list.length} applicants`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
