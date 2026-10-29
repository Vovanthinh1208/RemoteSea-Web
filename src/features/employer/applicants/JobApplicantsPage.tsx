import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { ApplicationDetailHeader } from "@/components/shared/ApplicationDetailHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  SELECT_INPUT_CLASS,
  TEXT_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import { ROUTES } from "@/constants/routes";
import {
  JOB_APPLICANTS_LIMIT,
  useEmployerJobs,
  useJobApplicants,
} from "@/features/employer/employer.queries";
import {
  APPLICANT_COLUMNS,
  APPLICANT_STATUS_FILTERS,
  groupByColumn,
  isApplicantStatusFilter,
} from "@/features/employer/applicants/applicant-columns";
import { STAGE_LABEL } from "@/features/talent/talent-dashboard.utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatLocalDate } from "@/utils/format";
import type { EmployerApplicant } from "@/types/employer";
import { useTranslation } from "@/i18n/useTranslation";

const TOP_SKILLS = 3;

// PB57 AC3: name, headline, main skills, AI CV score (if analysed) and the
// application date.
const ApplicantCard = ({ applicant }: { applicant: EmployerApplicant }) => {
  const { t } = useTranslation("employer");
  const { talent } = applicant;
  const name = talent.user.name ?? t("row.candidate");
  return (
    <li>
      <Link
        aria-label={t("applicants.openAria", { name })}
        className="block rounded-12 border border-neutral-100 bg-white p-3 transition-colors hover:border-brand-200 focus-visible:shadow-focus focus-visible:outline-none"
        to={ROUTES.employerApplicationDetail(applicant.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[13px] font-semibold text-neutral-900">
            {name}
          </p>
          <span
            className="inline-flex flex-shrink-0 items-center gap-0.5 text-[11.5px] font-medium text-brand-700"
            title={t("applicants.aiScore")}
          >
            <Sparkles size={11} />
            {applicant.cvAnalysis ? applicant.cvAnalysis.fitScore : "—"}
          </span>
        </div>
        {talent.headline && (
          <p className="mt-0.5 line-clamp-2 text-[12px] text-neutral-500">
            {talent.headline}
          </p>
        )}
        {talent.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {talent.skills.slice(0, TOP_SKILLS).map(({ skill }) => (
              <Tag key={skill.id}>{skill.name}</Tag>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-neutral-400">
          <span>
            {t("applicants.appliedOn", {
              date: formatLocalDate(applicant.appliedAt),
            })}
          </span>
          <Badge variant="muted">{STAGE_LABEL[applicant.status]}</Badge>
        </div>
      </Link>
    </li>
  );
};

const BoardSkeleton = () => (
  <div className="flex gap-3 overflow-hidden">
    {Array.from({ length: 4 }, (_, i) => (
      <Skeleton className="h-48 w-64 flex-shrink-0 rounded-16" key={i} />
    ))}
  </div>
);

export const JobApplicantsPage = () => {
  const { t } = useTranslation("employer");
  const { id = "" } = useParams<{ id: string }>();
  // PB57 AC4: name search and status filter, kept in the URL.
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(query.trim());
  const statusParam = params.get("status") ?? "";
  const status = isApplicantStatusFilter(statusParam) ? statusParam : undefined;

  const [prevQuery, setPrevQuery] = useState(debouncedQuery);
  if (debouncedQuery !== prevQuery) {
    setPrevQuery(debouncedQuery);
    const next = new URLSearchParams(params);
    if (debouncedQuery) next.set("q", debouncedQuery);
    else next.delete("q");
    setParams(next, { replace: true });
  }

  const { data: jobsData } = useEmployerJobs();
  const job = jobsData?.jobs.find((j) => j.id === id);
  const { data, isLoading, isError, refetch, isFetching } = useJobApplicants(
    id,
    { q: debouncedQuery || undefined, status }
  );
  useDocumentTitle(
    job ? t("applicants.docTitle", { title: job.title }) : t("applicants.title")
  );

  const applicants = data?.applications ?? [];
  const columns = groupByColumn(applicants);
  const total = data?.pagination.total ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <ApplicationDetailHeader
          backHref={ROUTES.employerDashboard}
          className="mb-5"
          subtitle={job?.title}
          title={t("applicants.title")}
        />

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={14}
            />
            <label className="sr-only" htmlFor="applicant-search">
              {t("applicants.searchLabel")}
            </label>
            <input
              className={`${TEXT_INPUT_CLASS} pl-8`}
              id="applicant-search"
              placeholder={t("applicants.searchPlaceholder")}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label className="sr-only" htmlFor="applicant-status">
            {t("applicants.statusLabel")}
          </label>
          <select
            className={`${SELECT_INPUT_CLASS} sm:w-56`}
            id="applicant-status"
            value={status ?? ""}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("status", e.target.value);
              else next.delete("status");
              setParams(next, { replace: true });
            }}
          >
            <option value="">{t("applicants.allStatuses")}</option>
            {APPLICANT_STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <BoardSkeleton />
        ) : isError ? (
          <EmptyState
            action={
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                {t("common.actions.retry")}
              </Button>
            }
            description={t("applicants.errorDesc")}
            title={t("applicants.errorTitle")}
          />
        ) : applicants.length === 0 ? (
          <EmptyState
            description={
              debouncedQuery || status
                ? t("applicants.noMatchDesc")
                : t("applicants.emptyDesc")
            }
            title={
              debouncedQuery || status
                ? t("applicants.noMatch")
                : t("applicants.empty")
            }
          />
        ) : (
          <>
            <p aria-live="polite" className="mb-3 text-[12px] text-neutral-500">
              {total > JOB_APPLICANTS_LIMIT
                ? t("applicants.showingSome", {
                    shown: applicants.length,
                    total,
                  })
                : t("applicants.count", { count: total })}
              {isFetching && ` · ${t("applicants.updating")}`}
            </p>
            {/* PB57 AC2: one column per pipeline stage, scrolling
                horizontally on narrow screens instead of the page. */}
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              <div className="flex gap-3">
                {APPLICANT_COLUMNS.map((column) => (
                  <section
                    aria-labelledby={`col-${column.id}`}
                    className="w-64 flex-shrink-0 rounded-16 bg-neutral-100/70 p-2.5"
                    key={column.id}
                  >
                    <h2
                      className="mb-2 flex items-center justify-between px-1 text-[12px] font-semibold uppercase tracking-wide text-neutral-600"
                      id={`col-${column.id}`}
                    >
                      {t(`applicants.col.${column.id}`)}
                      <span className="rounded-full bg-white px-1.5 text-[11px] text-neutral-500">
                        {columns[column.id].length}
                      </span>
                    </h2>
                    <ul className="space-y-2">
                      {columns[column.id].map((applicant) => (
                        <ApplicantCard
                          applicant={applicant}
                          key={applicant.id}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
