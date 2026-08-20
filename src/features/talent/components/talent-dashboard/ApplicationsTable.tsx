import { memo, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ChevronDown, MessageCircle } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import { countryFlag } from "@/utils/color";
import { timeAgoShort } from "@/utils/time";
import { Pipeline } from "@/features/talent/components/talent-dashboard/Pipeline";
import { ApplicationTimeline } from "@/features/talent/components/talent-dashboard/ApplicationTimeline";
import {
  buildTimelineSteps,
  STAGE_LABEL,
  STATUS_BADGE,
  STATUS_TO_BUCKET,
  type AppStatusBucket,
} from "@/features/talent/talent-dashboard.utils";
import type { ApplicationWithJob } from "@/types/application";
import { ROUTES } from "@/constants/routes";

type TabId = "all" | "active" | "offers" | "closed";

interface ApplicationRowProps {
  application: ApplicationWithJob;
}

const ApplicationRow = memo(function ApplicationRow({
  application: a,
}: ApplicationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const bucket = STATUS_TO_BUCKET[a.status];
  const s = STATUS_BADGE[bucket];
  const company = a.job.employer.companyName;
  const country = a.job.country ?? "Remote";
  const mainSteps = buildTimelineSteps(a).slice(0, 4);
  const dotFillClass = bucket === "closed" ? "bg-neutral-300" : "bg-brand-500";
  return (
    <div className="border-b border-neutral-50 last:border-none">
      <button
        aria-expanded={expanded}
        className="grid w-full grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50/60"
        type="button"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo name={company} size={36} />
          <div className="min-w-0">
            <Link
              className="block truncate text-[13.5px] font-medium text-neutral-900 hover:text-brand-700 hover:underline"
              to={ROUTES.jobDetail(a.jobId)}
              onClick={(e) => e.stopPropagation()}
            >
              {a.job.title}
            </Link>
            <p className="text-[12px] text-neutral-400">
              {company} · {countryFlag(a.job.country)} {country}
            </p>
          </div>
        </div>
        <Badge
          className="w-[100px] justify-center px-2.5 py-0.5"
          variant={s.variant}
        >
          {s.label}
        </Badge>
        <div className="hidden w-[140px] flex-col gap-1.5 md:flex">
          <div className="flex items-center gap-1">
            {mainSteps.map((step) => (
              <span
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  step.reached ? dotFillClass : "bg-neutral-100"
                )}
                key={step.status}
              />
            ))}
          </div>
          <span className="text-[11.5px] text-neutral-500">
            {STAGE_LABEL[a.status]}
          </span>
        </div>
        <span className="hidden w-[72px] text-right text-[12px] text-neutral-400 md:block">
          {timeAgoShort(a.appliedAt)}
        </span>
        {/* Grouped in one flex wrapper (rather than a second grid track) so
            the interview icon's conditional presence never shifts the grid's
            column count row-to-row. */}
        <div className="flex shrink-0 items-center gap-1">
          <Link
            aria-label="Message about this application"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            to={ROUTES.applicationMessages(a.id)}
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={16} />
          </Link>
          {a.status === "INTERVIEW" && (
            <Link
              aria-label="View interview"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              to={ROUTES.applicationInterview(a.id)}
              onClick={(e) => e.stopPropagation()}
            >
              <CalendarClock size={16} />
            </Link>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-neutral-300 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && <ApplicationTimeline application={a} />}
    </div>
  );
});

interface ApplicationsTableProps {
  applications: ApplicationWithJob[];
}

const isTabId = (v: string): v is TabId =>
  (["all", "active", "offers", "closed"] as const).includes(v as TabId);

// "all" can never hit this — its filtered list is `applications` itself, so
// it's only empty when the outer applications.length === 0 check already
// handled it. Still typed over every TabId so indexing below stays exhaustive.
const TAB_EMPTY_COPY: Record<TabId, { title: string; description: string }> = {
  all: {
    title: "No applications yet",
    description: "Jobs you apply to will show up here.",
  },
  active: {
    title: "No active applications",
    description:
      "Applications you're still waiting to hear back on will show up here.",
  },
  offers: {
    title: "No offers yet",
    description: "Offers you receive will show up here.",
  },
  closed: {
    title: "No closed applications",
    description:
      "Applications that were withdrawn or didn't move forward will show up here.",
  },
};

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

    return {
      byTab,
      notClosedCount: applications.length - buckets.closed.length,
    };
  }, [applications]);

  const filtered = grouped.byTab[tab];

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "All", count: applications.length },
    {
      id: "active",
      label: "Active",
      count: grouped.byTab.active.length,
    },
    {
      id: "offers",
      label: "Offers",
      count: grouped.byTab.offers.length,
    },
    {
      id: "closed",
      label: "Closed",
      count: grouped.byTab.closed.length,
    },
  ];

  return (
    <div className="mb-5 overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-neutral-900">
          Your applications{" "}
          <span className="font-normal text-neutral-400">
            · {grouped.notClosedCount} active
          </span>
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
              {t.label}{" "}
              <span className="ml-0.5 text-neutral-400">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <Pipeline applications={applications} />

      {applications.length === 0 ? (
        <EmptyState
          className="px-5 py-10"
          description={TAB_EMPTY_COPY.all.description}
          title={TAB_EMPTY_COPY.all.title}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          className="px-5 py-10"
          description={TAB_EMPTY_COPY[tab].description}
          title={TAB_EMPTY_COPY[tab].title}
        />
      ) : (
        <div>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b border-neutral-50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Role &amp; company</span>
            <span className="w-[100px] text-center">Status</span>
            <span className="hidden w-[140px] md:block">Stage</span>
            <span className="hidden w-[72px] text-right md:block">Applied</span>
            <span className="w-8" />
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
