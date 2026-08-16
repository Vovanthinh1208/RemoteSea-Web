import { Skeleton } from "@/components/ui/skeleton";

const KPI_SKELETON_COUNT = 3;
const ROW_SKELETON_COUNT = 6;
const REPORT_GRID_COLUMNS =
  "minmax(220px, 1fr) 160px 150px minmax(0, 1fr) 100px 170px";

export const AdminReportsSkeleton = () => (
  <div className="flex-1 overflow-hidden">
    <div className="mb-6">
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="h-7 w-28" />
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
          style={{ gridTemplateColumns: REPORT_GRID_COLUMNS }}
        >
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-8 w-24 justify-self-end rounded-8" />
        </div>
      ))}
    </div>
  </div>
);
