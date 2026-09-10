import { Skeleton } from "@/components/ui/skeleton";

const KPI_SKELETON_COUNT = 5;
const ROW_SKELETON_COUNT = 5;

// Mirrors TalentDashboard's actual structure — greeting, 5 KPI tiles, the
// applications table, and four stacked side panels (profile snapshot,
// invitations, alerts, activity) — rather than a handful of generic blocks.
// A shape-matched skeleton means the real content that pops in a beat later
// doesn't shift the page around it.
export const TalentDashboardSkeleton = () => (
  <div className="mx-auto max-w-[1240px] px-6 py-10">
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-12" />
        <Skeleton className="h-10 w-36 rounded-12" />
      </div>
    </div>

    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: KPI_SKELETON_COUNT }, (_, i) => (
        <Skeleton className="h-20 rounded-12" key={i} />
      ))}
    </div>

    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="overflow-hidden rounded-16 border border-neutral-100 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-48 rounded-8" />
        </div>
        {Array.from({ length: ROW_SKELETON_COUNT }, (_, i) => (
          <div
            className="flex items-center gap-4 border-b border-neutral-50 px-5 py-3.5 last:border-none"
            key={i}
          >
            <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-[100px] rounded-8" />
          </div>
        ))}
      </div>
      <div className="space-y-5">
        <Skeleton className="h-52 rounded-16" />
        <Skeleton className="h-28 rounded-16" />
        <Skeleton className="h-40 rounded-16" />
        <Skeleton className="h-40 rounded-16" />
      </div>
    </div>
  </div>
);
