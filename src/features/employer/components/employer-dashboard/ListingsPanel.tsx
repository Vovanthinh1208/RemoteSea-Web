import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Download, Eye, Lock, Pencil, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCloseJob } from "@/features/jobs/jobs.queries";
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
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation("employer");
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
  const closeJobMutation = useCloseJob();
  const [confirmClose, setConfirmClose] = useState(false);
  const runWithToast = useToastMutation();
  // PB42: drafts and listings sent back for changes are editable.
  const isEditable = j.status === "DRAFT" || j.status === "REJECTED";

  const handleClose = async (): Promise<void> => {
    setConfirmClose(false);
    await runWithToast(() => closeJobMutation.mutateAsync(j.id), {
      success: t("listings.closeDone"),
      error: t("listings.closeFailed"),
    });
  };
  const handleExport = async (e: React.MouseEvent): Promise<void> => {
    // The row itself is a Link (or, for a non-live job, a div with no
    // navigation at all) — this button lives inside it purely for layout,
    // not to trigger that row's own click behavior.
    e.preventDefault();
    e.stopPropagation();
    await runWithToast(
      () => exportCsvMutation.mutateAsync({ jobId: j.id, jobTitle: j.title }),
      {
        success: t("listings.exportDone"),
        error: t("listings.exportFailed"),
      }
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
              {t("listings.featured")}
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
                {t("listings.new", { count: newApps })}
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
        <span className="text-[12px] italic text-neutral-400">
          {t("listings.awaiting")}
        </span>
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
        <div className="text-[10px] text-neutral-400">
          {t("listings.views")}
        </div>
      </div>

      {isPubliclyViewable ? (
        <ChevronRight className="text-neutral-300" size={14} />
      ) : (
        <span />
      )}
    </>
  );

  // Only worth offering once there's something to export — an empty CSV
  // (header row only) isn't a useful download. "Export applicants" (not
  // "Export CSV") names the action, not its file format — CSV is an
  // implementation detail, and this label doesn't need to change if a
  // second format is ever added. A labeled chip (not a bare icon) so the
  // action reads on its own — this sits outside the row's own fixed-width
  // grid, so there's no column budget forcing it icon-only the way an
  // in-grid action would need. Text stays visible at every width (rather
  // than collapsing to icon-only on mobile); the grid's own `1fr` title
  // column absorbs the squeeze via its existing truncate, so this never
  // pushes the row into horizontal overflow. Muted/outlined styling keeps
  // it reading as a secondary utility, not a workflow action, next to the
  // row's own primary affordance (viewing the listing).
  const exportButton = total > 0 && (
    <button
      aria-busy={exportCsvMutation.isPending}
      aria-label={t("listings.exportAria", { title: j.title })}
      className="inline-flex h-8 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-8 border border-neutral-200 px-2.5 text-[11px] font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      disabled={exportCsvMutation.isPending}
      title={t("listings.exportTitle")}
      type="button"
      onClick={handleExport}
    >
      <Download size={12} />
      {exportCsvMutation.isPending
        ? t("listings.exporting")
        : t("listings.export")}
    </button>
  );

  const actionClass =
    "inline-flex h-8 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-8 border border-neutral-200 px-2.5 text-[11px] font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  // PB42 edit, PB48 member preview of a listing that isn't live, PB45 close
  // (one-way, so it goes through a confirmation dialog first).
  const manageActions = (
    <>
      {isEditable && (
        <Link
          aria-label={t("listings.editAria", { title: j.title })}
          className={actionClass}
          to={ROUTES.editJob(j.id)}
        >
          <Pencil size={12} />
          {t("listings.edit")}
        </Link>
      )}
      {!isPubliclyViewable && (
        <Link
          aria-label={t("listings.previewAria", { title: j.title })}
          className={actionClass}
          to={ROUTES.jobDetail(j.id)}
        >
          <Eye size={12} />
          {t("listings.preview")}
        </Link>
      )}
      {isPubliclyViewable && (
        <button
          aria-label={t("listings.closeAria", { title: j.title })}
          className={actionClass}
          disabled={closeJobMutation.isPending}
          type="button"
          onClick={() => setConfirmClose(true)}
        >
          <Lock size={12} />
          {t("listings.close")}
        </button>
      )}
      <ConfirmDialog
        destructive
        cancelLabel={t("listings.closeCancel")}
        confirmLabel={t("listings.closeConfirm")}
        description={t("listings.closeDescription", { title: j.title })}
        open={confirmClose}
        title={t("listings.closeTitle")}
        onCancel={() => setConfirmClose(false)}
        onConfirm={handleClose}
      />
    </>
  );

  // flex-wrap (not nowrap) — at the mobile grid's tightest column widths,
  // an inline "Export applicants" button doesn't fit without crushing the
  // title column's truncate down to near-nothing; wrapping it onto its own
  // line below costs a little row height instead of squeezing content that
  // matters more (the job title) just to keep a secondary action inline.
  if (isPubliclyViewable) {
    return (
      <div className="flex flex-wrap items-center gap-1 rounded-12 transition-colors hover:bg-neutral-50">
        <Link
          className="grid flex-1 cursor-pointer grid-cols-[1fr_64px_88px_20px] items-center gap-2 px-2 py-3 focus-visible:shadow-focus focus-visible:outline-none sm:grid-cols-[1fr_80px_120px_60px_32px] sm:gap-3"
          to={ROUTES.jobDetail(j.id)}
        >
          {rowContent}
        </Link>
        {exportButton}
        {manageActions}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-12">
      <div
        className="grid flex-1 grid-cols-[1fr_64px_88px_20px] items-center gap-2 px-2 py-3 sm:grid-cols-[1fr_80px_120px_60px_32px] sm:gap-3"
        title={t("listings.notLive")}
      >
        {rowContent}
      </div>
      {exportButton}
      {manageActions}
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
  const { t } = useTranslation("employer");
  const active = jobs.filter((j) => STATUS_GROUP[j.status] !== "closed").length;

  // rounded-16, not rounded-20 — matches EmployerDashboardSkeleton's
  // placeholder for this exact panel; was rounded-20 on the real card, so
  // the corner radius visibly snapped the instant real data loaded.
  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-neutral-900">
          {t("listings.title")}
          <span className="font-normal text-neutral-400">
            {t("listings.active", { count: active })}
          </span>
        </h3>
        <Link className={buttonVariants({ size: "sm" })} to={ROUTES.postJob}>
          <Plus size={11} /> {t("listings.postJob")}
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyRow>{t("listings.empty")}</EmptyRow>
      ) : (
        <>
          <div className="mb-1 grid grid-cols-[1fr_64px_88px_20px] gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:grid-cols-[1fr_80px_120px_60px_32px] sm:gap-3">
            <span>{t("listings.col.role")}</span>
            <span>{t("listings.col.status")}</span>
            <span>{t("listings.col.applications")}</span>
            <span className="hidden sm:block">{t("listings.col.views")}</span>
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
