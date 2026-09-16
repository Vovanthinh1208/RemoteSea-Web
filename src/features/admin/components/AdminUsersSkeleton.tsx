import { Skeleton } from "@/components/ui/skeleton";

const KPI_SKELETON_COUNT = 3;
const ROW_SKELETON_COUNT = 6;
// Matches AdminUsers.tsx's USER_GRID_COLUMNS exactly.
const USER_GRID_COLUMNS = "minmax(220px,1fr) 100px 120px 100px 160px";

export const AdminUsersSkeleton = () => (
  <div className="flex-1 overflow-hidden">
    <div className="mb-6">
      <Skeleton className="mb-2 h-3 w-20" />
      <Skeleton className="h-7 w-32" />
    </div>

    <div className="mb-6 grid grid-cols-3 gap-3">
      {Array.from({ length: KPI_SKELETON_COUNT }, (_, i) => (
        <Skeleton className="h-20 rounded-12" key={i} />
      ))}
    </div>

    <div className="overflow-hidden rounded-12 border border-neutral-100 bg-white">
      {Array.from({ length: ROW_SKELETON_COUNT }, (_, i) => (
        <div
          className="grid items-center gap-3 border-b border-neutral-50 px-5 py-4 last:border-0"
          key={i}
          style={{ gridTemplateColumns: USER_GRID_COLUMNS }}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-full rounded-8" />
        </div>
      ))}
    </div>
  </div>
);
