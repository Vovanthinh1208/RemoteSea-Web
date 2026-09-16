import { useMemo, useState } from "react";
import { useToastMutation } from "@/hooks/useToastMutation";
import {
  useAdminJobs,
  useReviewAdminJob,
} from "@/features/admin/admin.queries";
import {
  hoursSince,
  queuedAt,
  REVIEW_CHECKLIST,
  URGENT_WAIT_HOURS,
} from "@/features/admin/admin.utils";
import { AdminQueueSkeleton } from "@/features/admin/components/admin-queue/AdminQueueSkeleton";
import { QueueKpis } from "@/features/admin/components/admin-queue/QueueKpis";
import { QueueListPane } from "@/features/admin/components/admin-queue/QueueListPane";
import {
  ResolutionBanner,
  type ResolutionKind,
} from "@/features/admin/components/admin-queue/ResolutionBanner";
import { JobSummaryHeader } from "@/features/admin/components/admin-queue/JobSummaryHeader";
import { SubmissionSummary } from "@/features/admin/components/admin-queue/SubmissionSummary";
import { AutomatedChecks } from "@/features/admin/components/admin-queue/AutomatedChecks";
import { ReviewerChecklist } from "@/features/admin/components/admin-queue/ReviewerChecklist";
import { DecisionBar } from "@/features/admin/components/admin-queue/DecisionBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

const RESOLUTION_BANNER_DISPLAY_MS = 1200;

export const AdminQueue = () => {
  const runWithToast = useToastMutation();
  const { data, isLoading, isError, refetch } = useAdminJobs("PENDING_REVIEW");
  const reviewJobMutation = useReviewAdminJob();

  const [resolved, setResolved] = useState<Record<string, ResolutionKind>>({});
  const [checked, setChecked] = useState<Record<string, Set<number>>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{
    id: string;
    kind: ResolutionKind;
  } | null>(null);
  const [selId, setSelId] = useState<string | null>(null);

  const queue = data?.jobs ?? [];
  // Memoized so its identity is stable across the reviewer's typing/selection
  // state changes — `active` is the `jobs` prop of the memo'd QueueListPane, and
  // rebuilding the array every render (on every keystroke in the notes field,
  // every banner tick) silently defeated that memo and re-rendered the whole
  // pending-jobs list. Now the list only re-renders when the queue or a
  // resolution actually changes.
  const active = useMemo(
    () => queue.filter((j) => !resolved[j.id]),
    [queue, resolved]
  );
  // Keep showing the just-decided job (even though `decide()` already removed it
  // from `active`) ONLY if the reviewer hasn't since selected something else —
  // otherwise this used to force the view back to the decided job's banner even
  // after the reviewer had already moved on to reviewing a different one.
  const effectiveSelId =
    selId && (active.some((j) => j.id === selId) || banner?.id === selId)
      ? selId
      : (active[0]?.id ?? null);
  const sel = queue.find((j) => j.id === effectiveSelId);
  const isResolved = sel && resolved[sel.id];
  const selChecked =
    (effectiveSelId && checked[effectiveSelId]) || new Set<number>();

  const toggleChecklistItem = (i: number) => {
    if (!effectiveSelId) return;
    setChecked((prev) => {
      const cur = new Set(prev[effectiveSelId] ?? []);
      if (cur.has(i)) cur.delete(i);
      else cur.add(i);
      return { ...prev, [effectiveSelId]: cur };
    });
  };

  const decide = (kind: ResolutionKind) => {
    if (!effectiveSelId) return;
    const decidedId = effectiveSelId;
    // Pin explicitly, even if `decidedId` was only showing via the active[0]
    // default (never clicked) — otherwise the pin check below has nothing to match.
    setSelId(decidedId);
    const action = kind === "approved" ? "approve" : "reject";
    runWithToast(
      async () => {
        await reviewJobMutation.mutateAsync({
          id: decidedId,
          action,
          note: notes[decidedId] || undefined,
        });
        setResolved((prev) => ({ ...prev, [decidedId]: kind }));
        setBanner({ id: decidedId, kind });
        setTimeout(() => {
          // Only clear state that's still about this decision — if the reviewer has
          // since selected a different job, don't clobber their new selection.
          setBanner((prev) => (prev?.id === decidedId ? null : prev));
          setSelId((prev) => (prev === decidedId ? null : prev));
        }, RESOLUTION_BANNER_DISPLAY_MS);
      },
      {
        success:
          kind === "approved"
            ? "Job approved & published"
            : "Job sent back to employer",
        successVariant: kind === "approved" ? "success" : "info",
        error: "Couldn't submit review",
      }
    );
  };

  if (isLoading) {
    return <AdminQueueSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex-1">
        <EmptyState
          action={
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
          description="Something went wrong loading the review queue."
          title="Couldn't load the review queue"
        />
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex-1">
        <Eyebrow className="mb-0.5">Operations</Eyebrow>
        <h1 className="text-[26px] font-semibold text-neutral-900">
          Review queue
        </h1>
        <EmptyState
          description="Nothing awaiting review. All caught up."
          title="Queue is clear"
        />
      </div>
    );
  }

  if (!sel) return null;

  const reqCount = REVIEW_CHECKLIST.length;
  const doneCount = selChecked.size;
  const allDone = doneCount === reqCount;
  const overdue = active.filter(
    (j) => hoursSince(queuedAt(j)) >= URGENT_WAIT_HOURS
  ).length;
  const avgWait = active.length
    ? Math.round(
        active.reduce((a, j) => a + hoursSince(queuedAt(j)), 0) /
          active.length
      )
    : 0;
  const approvedCount = Object.values(resolved).filter(
    (v) => v === "approved"
  ).length;
  const rejectedCount = Object.values(resolved).filter(
    (v) => v !== "approved"
  ).length;

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Eyebrow className="mb-0.5">Operations</Eyebrow>
          {/* 26px — matches the ops console's denser page-title size (see AdminEmployers.tsx). */}
          <h1 className="text-[26px] font-semibold text-neutral-900">
            Review queue
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Every job is human-reviewed before it goes live · {active.length}{" "}
            awaiting
          </p>
        </div>
      </div>

      <QueueKpis
        activeCount={active.length}
        approvedCount={approvedCount}
        avgWaitHours={avgWait}
        overdueCount={overdue}
        rejectedCount={rejectedCount}
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "280px 1fr" }}>
        <QueueListPane
          jobs={active}
          onSelect={setSelId}
          selectedId={effectiveSelId}
        />

        <div className="overflow-hidden rounded-12 border border-neutral-100 bg-white">
          <ResolutionBanner banner={banner} jobId={sel.id} />
          <JobSummaryHeader job={sel} />

          <div
            className="overflow-y-auto p-5"
            style={{ maxHeight: "calc(100vh - 440px)" }}
          >
            <SubmissionSummary job={sel} />
            <AutomatedChecks job={sel} />
            <ReviewerChecklist
              checkedIndices={selChecked}
              disabled={!!isResolved}
              onToggle={toggleChecklistItem}
            />
            <DecisionBar
              canApprove={allDone}
              isPending={reviewJobMutation.isPending}
              note={notes[sel.id] ?? ""}
              resolution={isResolved}
              onApprove={() => decide("approved")}
              onNoteChange={(value) =>
                setNotes((prev) => ({ ...prev, [sel.id]: value }))
              }
              onReject={() => decide("rejected")}
              onRequestChanges={() => decide("changes")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
