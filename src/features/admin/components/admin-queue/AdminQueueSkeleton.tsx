import { Skeleton } from "@/components/ui/skeleton";

const KPI_SKELETON_COUNT = 4;
const ROW_SKELETON_COUNT = 5;

export const AdminQueueSkeleton = () => (
  <div className="flex-1 overflow-hidden">
    <div className="mb-6">
      <Skeleton className="mb-2 h-3 w-20" />
      <Skeleton className="h-7 w-40" />
    </div>

    <div className="mb-6 grid grid-cols-4 gap-3">
      {Array.from({ length: KPI_SKELETON_COUNT }, (_, i) => (
        <Skeleton className="h-20 rounded-12" key={i} />
      ))}
    </div>

    <div className="grid gap-4" style={{ gridTemplateColumns: "280px 1fr" }}>
      {/* Header bar + divided rows, matching QueueListPane's actual shell
          (a "Pending N / Oldest first" header over a flush divide-y list) —
          was a single padded block of gapped bars with no header at all. */}
      <div className="rounded-12 border border-neutral-100 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="divide-y divide-neutral-50">
          {Array.from({ length: ROW_SKELETON_COUNT }, (_, i) => (
            <div className="flex items-start gap-3 px-4 py-3" key={i}>
              <Skeleton className="h-[34px] w-[34px] flex-shrink-0 rounded-10" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job summary header + scrollable review body, matching the real
          two-zone panel (JobSummaryHeader over SubmissionSummary/
          AutomatedChecks/ReviewerChecklist/DecisionBar) instead of one
          undifferentiated gray block. */}
      <div className="overflow-hidden rounded-12 border border-neutral-100 bg-white">
        <div className="flex items-start gap-4 border-b border-neutral-100 p-5">
          <Skeleton className="h-[46px] w-[46px] flex-shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-5 w-56" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-4" />
              <Skeleton className="h-5 w-16 rounded-4" />
              <Skeleton className="h-5 w-16 rounded-4" />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <Skeleton className="h-16 rounded-10" />
          <Skeleton className="h-24 rounded-10" />
          <Skeleton className="h-32 rounded-10" />
        </div>
      </div>
    </div>
  </div>
);
