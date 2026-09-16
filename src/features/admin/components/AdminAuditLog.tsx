import { useState } from "react";
import { Briefcase, Building, ChevronDown, Flag, User } from "lucide-react";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { useAdminAuditLog } from "@/features/admin/admin.queries";
import { AdminAuditLogSkeleton } from "@/features/admin/components/AdminAuditLogSkeleton";
import {
  AUDIT_ACTION_IS_NEGATIVE,
  AUDIT_ACTION_LABEL,
  AUDIT_TARGET_TAB_LABEL,
  buildAuditDiff,
} from "@/features/admin/admin.utils";
import { EmptyRow } from "@/components/shared/EmptyRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PillToggle } from "@/components/shared/PillToggle";
import { Pagination } from "@/features/jobs/components/Pagination";
import { cn } from "@/utils/cn";
import { timeAgoLong } from "@/utils/time";
import type { AdminAuditLogEntry, AdminAuditTargetType } from "@/types/admin";

const TARGET_FILTERS: { id: AdminAuditTargetType | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "EMPLOYER", label: AUDIT_TARGET_TAB_LABEL.EMPLOYER },
  { id: "JOB", label: AUDIT_TARGET_TAB_LABEL.JOB },
  { id: "JOB_REPORT", label: AUDIT_TARGET_TAB_LABEL.JOB_REPORT },
  { id: "USER", label: AUDIT_TARGET_TAB_LABEL.USER },
];

const TARGET_ICON: Record<AdminAuditTargetType, typeof Building> = {
  EMPLOYER: Building,
  JOB: Briefcase,
  JOB_REPORT: Flag,
  USER: User,
};

const isTargetFilterId = (v: string): v is AdminAuditTargetType | "ALL" =>
  TARGET_FILTERS.some((f) => f.id === v);

const EntryRow = ({ entry }: { entry: AdminAuditLogEntry }) => {
  const [expanded, setExpanded] = useState(false);
  const TargetIcon = TARGET_ICON[entry.targetType];
  const negative = AUDIT_ACTION_IS_NEGATIVE[entry.action];
  const diff = buildAuditDiff(entry.before, entry.after);

  return (
    <div className="border-b border-neutral-50 last:border-0">
      <button
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none"
        type="button"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Muted, not red — a past/terminal state (suspended, rejected,
            dismissed) is a passive status here, not a destructive action to
            invite a click on. Same split the rest of the app already uses:
            red is for a live "Suspend"/"Reject" button, muted gray is for
            what already happened (see Badge's "muted" variant, or
            ApplicationsTable's STATUS_BADGE.closed). */}
        <span
          className={cn(
            "grid h-8 w-8 flex-shrink-0 place-items-center rounded-full",
            negative
              ? "bg-neutral-100 text-neutral-500"
              : "bg-brand-50 text-brand-700"
          )}
        >
          <TargetIcon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] text-neutral-800">
            <span className="font-medium text-neutral-900">
              {entry.adminEmail}
            </span>{" "}
            {AUDIT_ACTION_LABEL[entry.action].toLowerCase()}{" "}
            <span className="font-medium text-neutral-900">
              {entry.targetLabel}
            </span>
          </p>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            {timeAgoLong(entry.createdAt)}
          </p>
        </div>
        {diff.length > 0 && (
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 text-neutral-300 transition-transform",
              expanded && "rotate-180"
            )}
          />
        )}
      </button>
      {expanded && diff.length > 0 && (
        <div className="border-t border-neutral-50 bg-neutral-50/60 px-5 py-3 pl-[52px]">
          <dl className="space-y-1">
            {diff.map((row) => (
              <div
                className="flex items-center gap-2 text-[12.5px]"
                key={row.key}
              >
                <dt className="font-mono text-neutral-400">{row.key}</dt>
                <dd className="text-neutral-600">
                  {row.before} <span className="text-neutral-300">→</span>{" "}
                  <span className="font-medium text-neutral-900">
                    {row.after}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};

export const AdminAuditLog = () => {
  const [page, setPage] = useState(1);
  const [targetType, setTargetType] = useSearchParamState<
    AdminAuditTargetType | "ALL"
  >("auditTarget", "ALL", isTargetFilterId);

  const { data, isLoading, isError, refetch } = useAdminAuditLog(page, {
    targetType: targetType === "ALL" ? undefined : targetType,
  });

  if (isLoading) return <AdminAuditLogSkeleton />;
  if (isError) {
    return (
      <EmptyState
        action={
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        }
        description="Something went wrong loading the audit log."
        title="Couldn't load audit log"
      />
    );
  }

  const entries = data?.entries ?? [];

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-6">
        <Eyebrow className="mb-0.5">Accountability</Eyebrow>
        <h1 className="text-[26px] font-semibold text-neutral-900">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {data ? `${data.pagination.total} action` : "Loading actions"}
          {data && data.pagination.total === 1 ? "" : "s"} recorded — every
          employer verify/suspend, job approve/reject, and report
          resolve/dismiss.
        </p>
      </div>

      {/* No StatCard row here unlike the Employers/Reports tabs — this list
          is genuinely paginated (unlike those, which just fetch everything
          up to ADMIN_LIST_LIMIT), so a "today"/type-breakdown tile would
          only reflect whatever page happens to be loaded, not the real
          total. pagination.total above is the one number this endpoint
          returns that's actually accurate regardless of page. */}

      <div className="mb-4 flex gap-1">
        {TARGET_FILTERS.map((f) => (
          <PillToggle
            active={targetType === f.id}
            activeClassName="bg-brand-600 text-white"
            className="px-3.5 py-1.5 text-[13px] font-medium transition-colors"
            inactiveClassName="border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            key={f.id}
            onClick={() => {
              setTargetType(f.id);
              setPage(1);
            }}
          >
            {f.label}
          </PillToggle>
        ))}
      </div>

      <div className="overflow-hidden rounded-12 border border-neutral-100 bg-white">
        {entries.length === 0 ? (
          <EmptyRow>
            No moderation actions{targetType === "ALL" ? "" : " of this type"}{" "}
            yet.
          </EmptyRow>
        ) : (
          entries.map((entry) => <EntryRow entry={entry} key={entry.id} />)
        )}
      </div>

      {data && (
        <Pagination
          page={data.pagination.page}
          pages={data.pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
