import { memo, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ChevronDown, MessageCircle } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabList, Tab } from "@/components/ui/tabs";
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
import { useTranslation } from "@/i18n/useTranslation";

type TabId = "all" | "active" | "offers" | "closed";

interface ApplicationRowProps {
  application: ApplicationWithJob;
}

const ApplicationRow = memo(function ApplicationRow({
  application: a,
}: ApplicationRowProps) {
  const { t } = useTranslation("talent");
  const [expanded, setExpanded] = useState(false);
  const bucket = STATUS_TO_BUCKET[a.status];
  const s = STATUS_BADGE[bucket];
  const company = a.job.employer.companyName;
  const country = a.job.country ?? t("snapshot.remote");
  const mainSteps = buildTimelineSteps(a).slice(0, 4);
  const dotFillClass = bucket === "closed" ? "bg-neutral-300" : "bg-brand-500";
  return (
    <div className="border-b border-neutral-50 last:border-none">
      <div className="grid w-full grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50/60">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo name={company} size={36} />
          <div className="min-w-0">
            <Link
              className="block truncate text-[13.5px] font-medium text-neutral-900 hover:text-brand-700 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.jobDetail(a.jobId)}
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

        <div className="flex shrink-0 items-center gap-1">
          <Link
            aria-label={t("apps.messageAria")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
            to={ROUTES.applicationMessages(a.id)}
          >
            <MessageCircle size={16} />
          </Link>
          {a.status === "INTERVIEW" && (
            <Link
              aria-label={t("apps.interviewAria")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.applicationInterview(a.id)}
            >
              <CalendarClock size={16} />
            </Link>
          )}
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? t("apps.collapse") : t("apps.expand")}
          className="grid h-8 w-8 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown
            className={cn(
              "h-5 w-5 text-neutral-400 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
      </div>
      {expanded && <ApplicationTimeline application={a} />}
    </div>
  );
});

interface ApplicationsTableProps {
  applications: ApplicationWithJob[];
}

const isTabId = (v: string): v is TabId =>
  (["all", "active", "offers", "closed"] as const).includes(v as TabId);

export const ApplicationsTable = ({ applications }: ApplicationsTableProps) => {
  const { t } = useTranslation("talent");
  const [tab, setTab] = useSearchParamState<TabId>("appTab", "active", isTabId);

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
    { id: "all", label: t("apps.tab.all"), count: applications.length },
    {
      id: "active",
      label: t("apps.tab.active"),
      count: grouped.byTab.active.length,
    },
    {
      id: "offers",
      label: t("apps.tab.offers"),
      count: grouped.byTab.offers.length,
    },
    {
      id: "closed",
      label: t("apps.tab.closed"),
      count: grouped.byTab.closed.length,
    },
  ];

  return (
    <div className="mb-5 overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-neutral-900">
          {t("apps.title")}
          <span className="font-normal text-neutral-400">
            {t("apps.activeCount", { count: grouped.notClosedCount })}
          </span>
        </h3>
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
          <TabList variant="segmented">
            {tabs.map((tabItem) => (
              <Tab count={tabItem.count} key={tabItem.id} value={tabItem.id}>
                {tabItem.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </div>

      <Pipeline applications={applications} />

      {applications.length === 0 ? (
        <EmptyState
          action={
            <Link to={ROUTES.jobs}>
              <Button size="sm" variant="outline">
                {t("apps.browseJobs")}
              </Button>
            </Link>
          }
          className="px-5 py-10"
          description={t("apps.empty.all.desc")}
          title={t("apps.empty.all.title")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          className="px-5 py-10"
          description={t(`apps.empty.${tab}.desc`)}
          title={t(`apps.empty.${tab}.title`)}
        />
      ) : (
        <div>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b border-neutral-50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>{t("apps.col.role")}</span>
            <span className="w-[100px] text-center">
              {t("apps.col.status")}
            </span>
            <span className="hidden w-[140px] md:block">
              {t("apps.col.stage")}
            </span>
            <span className="hidden w-[72px] text-right md:block">
              {t("apps.col.applied")}
            </span>
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
