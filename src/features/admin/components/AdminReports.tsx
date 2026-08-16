import { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Flag, XCircle } from "lucide-react";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/shared/PillToggle";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { StatCard } from "@/components/ui/stat-card";
import { Tag } from "@/components/ui/tag";
import { useToastMutation } from "@/hooks/useToastMutation";
import { AdminReportsSkeleton } from "@/features/admin/components/AdminReportsSkeleton";
import {
  useAdminReports,
  useResolveAdminReport,
} from "@/features/admin/admin.queries";
import { JOB_REPORT_REASON_LABELS } from "@/types/job-report";
import { ROUTES } from "@/constants/routes";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { AdminJobReport } from "@/types/admin";
import type { JobReportStatus } from "@/types/job-report";

const FILTERS = [
  { id: "OPEN", label: "Open" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "DISMISSED", label: "Dismissed" },
] as const;

const REPORT_GRID_COLUMNS =
  "minmax(220px, 1fr) 160px 150px minmax(0, 1fr) 100px 170px";

interface ReportRowProps {
  report: AdminJobReport;
  isPending: boolean;
  onResolve: (id: string, action: "resolve" | "dismiss") => void;
}

const ReportRow = memo(function ReportRow({
  report: r,
  isPending,
  onResolve,
}: ReportRowProps) {
  return (
    <div
      className="grid items-center border-b border-neutral-50 px-5 py-4 transition-colors last:border-0 hover:bg-neutral-50"
      style={{ gridTemplateColumns: REPORT_GRID_COLUMNS }}
    >
      <div className="min-w-0">
        <Link
          className="truncate text-[14px] font-semibold text-neutral-900 hover:text-brand-700"
          to={ROUTES.jobDetail(r.job.id)}
        >
          {r.job.title}
        </Link>
        <div className="truncate text-[12px] text-neutral-400">
          {r.job.employer.companyName}
        </div>
      </div>

      <div className="truncate text-[13px] text-neutral-600">
        {r.reporter.name ?? r.reporter.email}
      </div>

      <div>
        <Tag>{JOB_REPORT_REASON_LABELS[r.reason]}</Tag>
      </div>

      <div className="truncate text-[12.5px] text-neutral-500">
        {r.details ?? "—"}
      </div>

      <span className="text-[13px] text-neutral-400">
        {new Date(r.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>

      <div className="flex justify-end gap-2">
        {r.status === "OPEN" ? (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onResolve(r.id, "resolve")}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-8 border border-brand-200 bg-brand-50 px-2.5 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={12} /> Resolve
            </button>
            <ConfirmAction
              isPending={isPending}
              message="Dismiss this report?"
              onConfirm={() => onResolve(r.id, "dismiss")}
            >
              {({ onClick }) => (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={onClick}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-8 border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XCircle size={12} /> Dismiss
                </button>
              )}
            </ConfirmAction>
          </>
        ) : (
          <Tag
            className={
              r.status === "RESOLVED" ? "bg-brand-50 text-brand-700" : ""
            }
          >
            {r.status === "RESOLVED" ? "Resolved" : "Dismissed"}
          </Tag>
        )}
      </div>
    </div>
  );
});

export const AdminReports = () => {
  const runWithToast = useToastMutation();
  const isStatusId = (v: string): v is (typeof FILTERS)[number]["id"] =>
    FILTERS.some((f) => f.id === v);
  const [status, setStatus] = useSearchParamState<JobReportStatus>(
    "reportStatus",
    "OPEN",
    isStatusId
  );
  const { data, isLoading, isError, refetch } = useAdminReports(status);
  const resolveMutation = useResolveAdminReport();

  const reports = data?.reports ?? [];
  const openCount = status === "OPEN" ? reports.length : 0;

  const { mutateAsync: resolve } = resolveMutation;
  const handleResolve = useCallback(
    (id: string, action: "resolve" | "dismiss") =>
      runWithToast(() => resolve({ id, action }), {
        success: action === "resolve" ? "Report resolved" : "Report dismissed",
        error: "Couldn't update report",
      }),
    [resolve, runWithToast]
  );

  if (isLoading) return <AdminReportsSkeleton />;
  if (isError) {
    return (
      <EmptyState
        action={
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        }
        description="Something went wrong loading reports."
        title="Couldn't load reports"
      />
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-6">
        <Eyebrow className="mb-0.5">Trust &amp; safety</Eyebrow>
        <h1 className="text-[26px] font-semibold text-neutral-900">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Listings flagged by talent or employers as suspicious.
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard
          icon={Flag}
          label="Open reports"
          sub="need review"
          value={status === "OPEN" ? reports.length : "—"}
          warn={status === "OPEN" && openCount > 0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          sub="this view"
          value={status === "RESOLVED" ? reports.length : "—"}
        />
        <StatCard
          icon={AlertTriangle}
          label="Dismissed"
          sub="this view"
          value={status === "DISMISSED" ? reports.length : "—"}
        />
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-1">
        {FILTERS.map((f) => (
          <PillToggle
            active={status === f.id}
            activeClassName="bg-brand-600 text-white"
            className="px-3.5 py-1.5 text-[13px] font-medium transition-colors"
            inactiveClassName="border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            key={f.id}
            onClick={() => setStatus(f.id)}
          >
            {f.label}
          </PillToggle>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-12 border border-neutral-100 bg-white">
        <div
          className="grid border-b border-neutral-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
          style={{ gridTemplateColumns: REPORT_GRID_COLUMNS }}
        >
          <span>Job</span>
          <span>Reporter</span>
          <span>Reason</span>
          <span>Details</span>
          <span>Reported</span>
          <span />
        </div>
        {reports.length === 0 ? (
          <EmptyRow>
            No {FILTERS.find((f) => f.id === status)?.label.toLowerCase()}{" "}
            reports.
          </EmptyRow>
        ) : (
          reports.map((r) => (
            <ReportRow
              isPending={
                resolveMutation.isPending &&
                resolveMutation.variables?.id === r.id
              }
              key={r.id}
              report={r}
              onResolve={handleResolve}
            />
          ))
        )}
      </div>
    </div>
  );
};
