import { Skeleton } from "@/components/ui/skeleton";

const KPI_SKELETON_COUNT = 4;
const ROW_SKELETON_COUNT = 5;

// Mirrors EmployerDashboard's layout: greeting block, 4 KPI cards, then the
// listings/applicants column beside the company/funnel column. Without this
// gate the dashboard rendered real UI with fake data during load ("0
// applicants across 0 live roles") and then snapped to the real numbers.
export const EmployerDashboardSkeleton = () => (
  <div className="min-h-screen bg-neutral-50">
    <div className="mx-auto max-w-[1240px] px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-3 w-32" />
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-12" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: KPI_SKELETON_COUNT }, (_, i) => (
          <Skeleton className="h-24 rounded-12" key={i} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-16 border border-neutral-100 bg-white">
            <div className="border-b border-neutral-100 px-5 py-4">
              <Skeleton className="h-4 w-32" />
            </div>
            {Array.from({ length: ROW_SKELETON_COUNT }, (_, i) => (
              <div
                className="flex items-center gap-4 border-b border-neutral-50 px-5 py-3.5 last:border-none"
                key={i}
              >
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-16" />
          <Skeleton className="h-64 rounded-16" />
        </div>
      </div>
    </div>
  </div>
);
