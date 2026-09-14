import { Skeleton } from "@/components/ui/skeleton";

const KPI_SKELETON_COUNT = 5;
const ROW_SKELETON_COUNT = 5;

// Mirrors EmployerDashboard's actual layout — greeting block, 5 KPI cards,
// then two stacked main-column panels (listings + applicants) beside four
// stacked sidebar items (company card, two link rows, funnel) — not just a
// couple of generic blocks. Without this gate the dashboard either rendered
// real UI with fake data during load ("0 applicants across 0 live roles")
// or shifted the whole page around once the real, differently-shaped
// content popped in.
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

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: KPI_SKELETON_COUNT }, (_, i) => (
          <Skeleton className="h-24 rounded-20" key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
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
          <div className="overflow-hidden rounded-16 border border-neutral-100 bg-white">
            <div className="border-b border-neutral-100 px-5 py-4">
              <Skeleton className="h-4 w-36" />
            </div>
            {Array.from({ length: ROW_SKELETON_COUNT }, (_, i) => (
              <div
                className="flex items-center gap-3 border-b border-neutral-50 px-5 py-3.5 last:border-none"
                key={i}
              >
                <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-20" />
          <Skeleton className="h-11 rounded-12" />
          <Skeleton className="h-11 rounded-12" />
          <Skeleton className="h-40 rounded-20" />
        </div>
      </div>
    </div>
  </div>
);
