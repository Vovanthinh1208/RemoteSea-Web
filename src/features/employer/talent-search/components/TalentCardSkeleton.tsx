import { Skeleton } from "@/components/ui/skeleton";

export const TalentCardSkeleton = () => (
  <div className="flex items-start gap-4 rounded-12 border border-neutral-100 bg-white p-5">
    <Skeleton className="h-11 w-11 flex-shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2.5">
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="h-4 w-64" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
    {/* Availability badge + salary badge + invite button — every real
        TalentCard renders all three stacked here (talent search always
        filters to isOpenToWork), so a single placeholder undersold the
        shape and let two more blocks pop in once data arrived. */}
    <div className="flex flex-shrink-0 flex-col items-end gap-2">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-6 w-24" />
    </div>
  </div>
);
