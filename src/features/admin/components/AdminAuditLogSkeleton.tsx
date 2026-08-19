import { Skeleton } from "@/components/ui/skeleton";

const ROW_SKELETON_COUNT = 8;

export const AdminAuditLogSkeleton = () => (
  <div className="flex-1 overflow-hidden">
    <div className="mb-6">
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="h-7 w-40" />
    </div>
    <div className="mb-4 flex gap-1">
      <Skeleton className="h-8 w-16 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-14 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
    <div className="overflow-hidden rounded-12 border border-neutral-100 bg-white">
      {Array.from({ length: ROW_SKELETON_COUNT }, (_, i) => (
        <div
          className="flex items-center gap-3 border-b border-neutral-50 px-5 py-4 last:border-0"
          key={i}
        >
          <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-24" />
          </div>
          {/* Stands in for the row's expand chevron, not a text line — same
              small square shape, not a wide bar. */}
          <Skeleton className="h-4 w-4 flex-shrink-0 rounded-4" />
        </div>
      ))}
    </div>
  </div>
);
