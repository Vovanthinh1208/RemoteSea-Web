import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the real page's actual shape (hero card, main-column sections,
// sidebar cards) rather than one flat block — so the content that pops in a
// moment later doesn't shift the page around it (same reasoning as
// TalentDashboardSkeleton).
export const ProfileSkeleton = () => (
  <div className="mx-auto max-w-[1200px] px-6 py-10">
    <div className="mb-6 grid gap-6 rounded-24 border border-neutral-100 bg-white p-8 lg:grid-cols-[auto_1fr_auto]">
      <Skeleton className="h-20 w-20 flex-shrink-0 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-16 lg:w-[200px]" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <Skeleton className="h-40 rounded-20" />
        <Skeleton className="h-52 rounded-20" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-20" />
        <Skeleton className="h-28 rounded-20" />
      </div>
    </div>
  </div>
);
