import { Skeleton } from "@/components/ui/skeleton";

export const NotificationRowSkeleton = () => (
  <div className="flex items-start gap-3 border-b border-neutral-100 px-4 py-4 last:border-0">
    <Skeleton className="mt-0.5 h-2 w-2 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3.5 w-5/6" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);
