import { cn } from "@/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { useHiringFunnel } from "@/features/employer/employer.queries";

const MIN_FUNNEL_BAR_PCT = 6;
const SKELETON_BAR_COUNT = 6;
// A drop-off worth calling out on a compact sidebar widget — anything below
// this is noise (a handful of rejections isn't a hiring-pipeline signal).
const NOTABLE_REJECTION_PCT = 20;

export const FunnelPanel = () => {
  const { data, isLoading } = useHiringFunnel();

  if (isLoading) {
    return (
      <div className="rounded-20 border border-neutral-100 bg-white p-5">
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="space-y-2.5">
          {Array.from({ length: SKELETON_BAR_COUNT }, (_, i) => (
            <Skeleton className="h-2.5 w-full rounded-full" key={i} />
          ))}
        </div>
      </div>
    );
  }

  // No company yet (COMPANY_MEMBERSHIP_REQUIRED) — same "just don't render
  // it" treatment CompanyCard gets in EmployerDashboard for the same case.
  if (!data) return null;

  const { stages, dropOff } = data;
  const total = stages[0]?.count ?? 0;
  const rejected = dropOff.find((d) => d.status === "REJECTED")?.count ?? 0;
  const rejectionPct = total > 0 ? Math.round((rejected / total) * 100) : 0;

  return (
    <div className="rounded-20 border border-neutral-100 bg-white p-5">
      <h3 className="mb-4 text-[14px] font-semibold text-neutral-900">
        Hiring funnel{" "}
        <span className="font-normal text-neutral-400">· all listings</span>
      </h3>
      {total === 0 ? (
        <p className="text-[12.5px] text-neutral-400">No applications yet.</p>
      ) : (
        <>
          <div className="space-y-2.5">
            {stages.map((s) => (
              <div className="flex items-center gap-3" key={s.status}>
                <span className="w-20 flex-shrink-0 truncate text-[12px] text-neutral-500">
                  {s.label}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      s.status === "OFFER_ACCEPTED"
                        ? "bg-brand-500"
                        : "bg-amber-400"
                    )}
                    style={{
                      width: `${Math.max(s.conversionFromFirst, MIN_FUNNEL_BAR_PCT)}%`,
                    }}
                  />
                </div>
                <span className="w-6 flex-shrink-0 text-right text-[12px] font-semibold text-neutral-700">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
          {rejectionPct >= NOTABLE_REJECTION_PCT && (
            <p className="mt-3 text-[11.5px] text-neutral-400">
              {rejected} rejected ({rejectionPct}% of applicants)
            </p>
          )}
        </>
      )}
    </div>
  );
};
