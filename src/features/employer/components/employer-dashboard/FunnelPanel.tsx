import { cn } from "@/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";
import type { HiringFunnelResponse } from "@/types/employer";

const MIN_FUNNEL_BAR_PCT = 6;
const SKELETON_BAR_COUNT = 6;
// A drop-off worth calling out on a compact sidebar widget — anything below
// this is noise (a handful of rejections isn't a hiring-pipeline signal).
const NOTABLE_REJECTION_PCT = 20;

type FunnelPanelProps = {
  data: HiringFunnelResponse | null;
  isLoading: boolean;
};

// Presentational — EmployerDashboard (its only caller) now sources this from
// useEmployerDashboard's single aggregate request instead of this component
// firing its own useHiringFunnel() call, same reasoning as ListingsPanel/
// ApplicantsPanel taking their data as props.
export const FunnelPanel = ({ data, isLoading }: FunnelPanelProps) => {
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
            {stages.map((s, i) => (
              <div className="flex items-center gap-3" key={s.status}>
                <span className="w-20 flex-shrink-0 truncate text-[12px] text-neutral-500">
                  {s.label}
                </span>
                <div
                  aria-label={`${s.label}: ${s.count} applicant${s.count === 1 ? "" : "s"}, ${s.conversionFromFirst}% of total applied`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={s.conversionFromFirst}
                  className="flex-1 overflow-hidden rounded-full bg-neutral-100"
                  role="progressbar"
                >
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
                {/* Stage-over-stage, not cumulative-from-first — this is
                    the number that actually says where the funnel leaks
                    (e.g. "only 20% of reviewed applicants get shortlisted"),
                    which conversionFromFirst can't show once more than one
                    stage has already dropped people. Empty (not omitted) on
                    the first stage — 100% of itself isn't useful
                    information, but the column still needs to hold its
                    width so every row's count aligns in the same place. */}
                <span className="w-9 flex-shrink-0 text-right text-[11px] text-neutral-400">
                  {i > 0 ? `${s.conversionFromPrevious}%` : ""}
                </span>
                <span className="w-6 flex-shrink-0 text-right text-[12px] font-semibold text-neutral-700">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-neutral-300">
            % shown is conversion from the stage above it.
          </p>
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
