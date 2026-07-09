import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { companyColor, countryFlag } from "@/features/jobs/jobs.utils";
import { Pipeline } from "@/features/talent/components/talent-dashboard/Pipeline";
import {
  STAGE_LABEL,
  STATUS_TO_BUCKET,
  type AppStatusBucket,
} from "@/features/talent/talent-dashboard.utils";
import type { ApplicationWithJob } from "@/types/application";

const STATUS_MAP: Record<AppStatusBucket, { label: string; variant: BadgeVariant }> = {
  applied: { label: "Applied", variant: "info" },
  review: { label: "In review", variant: "warning" },
  interview: { label: "Interviewing", variant: "positive" },
  offer: { label: "Offer", variant: "success" },
  closed: { label: "Closed", variant: "muted" },
};

type TabId = "all" | "active" | "offers" | "closed";

interface ApplicationRowProps {
  application: ApplicationWithJob;
}

const ApplicationRow = memo(function ApplicationRow({ application: a }: ApplicationRowProps) {
  const bucket = STATUS_TO_BUCKET[a.status];
  const s = STATUS_MAP[bucket];
  const company = a.job.employer.companyName;
  const country = a.job.country ?? "Remote";
  return (
    <Link
      className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-neutral-50 px-5 py-3.5 transition-colors last:border-none hover:bg-neutral-50/60"
      to={`/jobs/${a.jobId}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <CompanyLogo
          color={companyColor(company)}
          initial={company.charAt(0).toUpperCase()}
          size={36}
        />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-neutral-900">{a.job.title}</p>
          <p className="text-[12px] text-neutral-400">
            {company} · {countryFlag(a.job.country)} {country}
          </p>
        </div>
      </div>
      <Badge className="w-[100px] justify-center px-2.5 py-0.5" variant={s.variant}>
        {s.label}
      </Badge>
      <span className="hidden w-[140px] text-[12px] text-neutral-500 md:block">
        {STAGE_LABEL[a.status]}
      </span>
      <span className="hidden w-[72px] text-right text-[12px] text-neutral-400 md:block">
        {new Date(a.appliedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
      </span>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-neutral-300" />
    </Link>
  );
});

interface ApplicationsTableProps {
  applications: ApplicationWithJob[];
}

const isTabId = (v: string): v is TabId =>
  (["all", "active", "offers", "closed"] as const).includes(v as TabId);

export const ApplicationsTable = ({ applications }: ApplicationsTableProps) => {
  // URL-synced so reloading (or sharing the link) doesn't silently revert to "Active".
  const [tab, setTab] = useSearchParamState<TabId>("appTab", "active", isTabId);

  // Single O(n) bucketing pass instead of re-filtering `applications` once per tab
  // count plus once for the visible rows (previously 6 separate .filter() passes
  // over the same array on every render).
  const grouped = useMemo(() => {
    const buckets: Record<AppStatusBucket, ApplicationWithJob[]> = {
      applied: [],
      review: [],
      interview: [],
      offer: [],
      closed: [],
    };
    for (const a of applications) buckets[STATUS_TO_BUCKET[a.status]].push(a);

    const byTab: Record<TabId, ApplicationWithJob[]> = {
      all: applications,
      active: [...buckets.applied, ...buckets.review, ...buckets.interview],
      offers: buckets.offer,
      closed: buckets.closed,
    };

    return { byTab, notClosedCount: applications.length - buckets.closed.length };
  }, [applications]);

  const filtered = grouped.byTab[tab];

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "All", count: applications.length },
    { id: "active", label: "Active", count: grouped.byTab.active.length },
    { id: "offers", label: "Offers", count: grouped.byTab.offers.length },
    { id: "closed", label: "Closed", count: grouped.byTab.closed.length },
  ];

  return (
    <div className="mb-5 overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-neutral-900">
          Your applications{" "}
          <span className="font-normal text-neutral-400">· {grouped.notClosedCount} active</span>
        </h3>
        <div className="flex items-center gap-0.5 rounded-8 bg-neutral-100 p-0.5">
          {tabs.map((t) => (
            <button
              aria-pressed={tab === t.id}
              className={cn(
                "rounded-6 px-3 py-1 text-[12px] font-medium transition-all",
                tab === t.id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
              key={t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label} <span className="ml-0.5 text-neutral-400">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <Pipeline applications={applications} />

      {applications.length === 0 ? (
        <EmptyState
          className="px-5 py-10"
          description="Jobs you apply to will show up here."
          title="No applications yet"
        />
      ) : (
        <div>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-neutral-50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Role &amp; company</span>
            <span className="w-[100px] text-center">Status</span>
            <span className="hidden w-[140px] md:block">Stage</span>
            <span className="hidden w-[72px] text-right md:block">Applied</span>
            <span className="w-5" />
          </div>
          {filtered.map((a) => (
            <ApplicationRow application={a} key={a.id} />
          ))}
        </div>
      )}
    </div>
  );
};
