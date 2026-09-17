import { memo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Download, Plus } from "lucide-react";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import {
  STATUS_GROUP,
  STATUS_LABEL,
  timeAgo,
} from "@/features/employer/employer-dashboard.utils";
import type { EmployerApplicant, EmployerJobListItem } from "@/types/employer";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/components/ui/button";
import { percent } from "@/utils/percent";
import { useExportJobApplicantsCsv } from "@/features/employer/employer.queries";
import { useToastMutation } from "@/hooks/useToastMutation";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  review: "warning",
  live: "positive",
  closed: "muted",
};

const EMPTY_APPLICATIONS: EmployerApplicant[] = [];

interface ListingRowProps {
  job: EmployerJobListItem;
  applications: EmployerApplicant[];
}

const ListingRow = memo(function ListingRow({
  job: j,
  applications: apps,
}: ListingRowProps) {
  const total = j._count.applications;
  const reviewed = apps.filter((a) => a.status !== "PENDING").length;
  const shortlisted = apps.filter((a) => a.status === "SHORTLISTED").length;
  const newApps = apps.filter((a) => a.status === "PENDING").length;
  const reviewPct = percent(reviewed, total);
  const shortPct = percent(shortlisted, total);

  // The public job detail page only serves ACTIVE listings (drafts, pending
  // review, closed, and rejected jobs 404 there by design) — so only link an
  // employer's own row through when it's actually live; otherwise render the
  // same row without navigation instead of sending them to a broken page.
  const isPubliclyViewable = j.status === "ACTIVE";

  const exportCsvMutation = useExportJobApplicantsCsv();
  const runWithToast = useToastMutation();
  const handleExport = async (e: React.MouseEvent): Promise<void> => {
    // The row itself is a Link (or, for a non-live job, a div with no
    // navigation at all) — this button lives inside it purely for layout,
    // not to trigger that row's own click behavior.
    e.preventDefault();
    e.stopPropagation();
    await runWithToast(
      () => exportCsvMutation.mutateAsync({ jobId: j.id, jobTitle: j.title }),
      { error: "Couldn't export applicants. Please try again." }
    );
  };

  const rowContent = (
    <>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13.5px] font-medium text-neutral-900">
            {j.title}
          </span>
          {j.planType === "FEATURED" && (
            <span className="flex-shrink-0 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9.5px] font-bold text-white">
              Featured
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] text-neutral-400">
          <span>{timeAgo(j.publishedAt ?? j.createdAt)}</span>
        </div>
      </div>

      <Badge
        className="w-fit px-2 py-0.5 text-[11px]"
        variant={STATUS_VARIANT[STATUS_GROUP[j.status]]}
      >
        {STATUS_LABEL[j.status]}
      </Badge>

      {total > 0 ? (
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-neutral-900">
              {total}
            </span>
            {newApps > 0 && (
              <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                +{newApps} new
              </span>
            )}
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <span
              className="absolute h-full rounded-full bg-amber-300"
              style={{ width: `${reviewPct}%` }}
            />
            <span
              className="absolute h-full rounded-full bg-brand-500"
              style={{ width: `${shortPct}%` }}
            />
          </div>
        </div>
      ) : (
        <span className="text-[12px] italic text-neutral-400">Awaiting</span>
      )}

      {/* Dropped below sm — the mobile grid template only has 4 columns
          (see the className below); this stays a straightforward hidden
          cell rather than folding view count into another column, so
          nothing here needs conditional content, just conditional
          visibility. */}
      <div className="hidden text-center sm:block">
        <div className="text-[13px] font-semibold text-neutral-700">
          {j.viewCount}
        </div>
        <div className="text-[10px] text-neutral-400">views</div>
      </div>

      {isPubliclyViewable ? (
        <ChevronRight className="text-neutral-300" size={14} />
      ) : (
        <span />
      )}
    </>
  );

  // Only worth offering once there's something to export — an empty CSV
  // (header row only) isn't a useful download.
  const exportButton = total > 0 && (
    <button
      aria-label={`Export ${j.title} applicants as CSV`}
      className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      disabled={exportCsvMutation.isPending}
      title="Export applicants as CSV"
      type="button"
      onClick={handleExport}
    >
      <Download size={14} />
    </button>
  );

  if (isPubliclyViewable) {
    return (
      <div className="flex items-center gap-1 rounded-12 transition-colors hover:bg-neutral-50">
        <Link
          className="grid flex-1 cursor-pointer grid-cols-[1fr_64px_88px_20px] items-center gap-2 px-2 py-3 focus-visible:shadow-focus focus-visible:outline-none sm:grid-cols-[1fr_80px_120px_60px_32px] sm:gap-3"
          to={ROUTES.jobDetail(j.id)}
        >
          {rowContent}
        </Link>
        {exportButton}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-12">
      <div
        className="grid flex-1 grid-cols-[1fr_64px_88px_20px] items-center gap-2 px-2 py-3 sm:grid-cols-[1fr_80px_120px_60px_32px] sm:gap-3"
        title="This listing isn't live yet, so it doesn't have a public page to view."
      >
        {rowContent}
      </div>
      {exportButton}
    </div>
  );
});

interface ListingsPanelProps {
  jobs: EmployerJobListItem[];
  applicationsByJob: Map<string, EmployerApplicant[]>;
}

export const ListingsPanel = ({
  jobs,
  applicationsByJob,
}: ListingsPanelProps) => {
  const active = jobs.filter((j) => STATUS_GROUP[j.status] !== "closed").length;

  // rounded-16, not rounded-20 — matches EmployerDashboardSkeleton's
  // placeholder for this exact panel; was rounded-20 on the real card, so
  // the corner radius visibly snapped the instant real data loaded.
  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-neutral-900">
          Your listings{" "}
          <span className="font-normal text-neutral-400">
            · {active} active
          </span>
        </h3>
        <Link className={buttonVariants({ size: "sm" })} to={ROUTES.postJob}>
          <Plus size={11} /> Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyRow>
          No listings yet. Post your first job to start hiring.
        </EmptyRow>
      ) : (
        <>
          <div className="mb-1 grid grid-cols-[1fr_64px_88px_20px] gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:grid-cols-[1fr_80px_120px_60px_32px] sm:gap-3">
            <span>Role</span>
            <span>Status</span>
            <span>Applications</span>
            <span className="hidden sm:block">Views</span>
            <span />
          </div>

          <div className="divide-y divide-neutral-50">
            {jobs.map((j) => (
              <ListingRow
                applications={applicationsByJob.get(j.id) ?? EMPTY_APPLICATIONS}
                job={j}
                key={j.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
