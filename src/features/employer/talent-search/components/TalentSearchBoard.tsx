import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { TalentFilterSidebar } from "@/features/employer/talent-search/components/TalentFilterSidebar";
import { TalentCard } from "@/features/employer/talent-search/components/TalentCard";
import { TalentCardSkeleton } from "@/features/employer/talent-search/components/TalentCardSkeleton";
import { JobContextSelect } from "@/features/employer/talent-search/components/JobContextSelect";
import { Pagination } from "@/features/jobs/components/Pagination";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useDebouncedSearchSync } from "@/hooks/useDebouncedSearchSync";
import { useToastMutation } from "@/hooks/useToastMutation";
import { ApiError } from "@/core/errors/api-error";
import { getErrorMessage } from "@/core/errors/localize";
import { useTalentSearchQuery } from "@/features/employer/talent-search/talent-search.queries";
import { useEmployerJobs } from "@/features/employer/employer.queries";
import { useSendInvitation } from "@/features/invitations/invitations.queries";
import { computeMatchScore } from "@/features/matching/match.util";
import {
  DEFAULT_TALENT_SEARCH_FILTERS,
  type TalentSearchFilters,
} from "@/features/employer/talent-search/talent-search.filters";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";

interface TalentSearchBoardProps {
  filters: TalentSearchFilters;
  onFiltersChange: (filters: TalentSearchFilters) => void;
}

const TALENT_LIST_SKELETON_COUNT = 6;

export const TalentSearchBoard = ({
  filters: query,
  onFiltersChange,
}: TalentSearchBoardProps) => {
  const { t, formatNumber } = useTranslation("employer");
  const [search, setSearch] = useSyncedState(query.q);
  const [sortByMatch, setSortByMatch] = useState(false);
  // Session-local "already invited" tracking — see talent-search plan notes:
  // not a new sent-ids endpoint, a stale reload that re-sends is caught
  // cleanly by the backend's ALREADY_INVITED conflict instead.
  const [invitedTalentIds, setInvitedTalentIds] = useState<Set<string>>(
    new Set()
  );
  const runWithToast = useToastMutation();
  const sendInvitation = useSendInvitation();
  const { data, isLoading, isFetching, isError, isPlaceholderData, refetch } =
    useTalentSearchQuery(query);
  const { data: jobsData } = useEmployerJobs();
  const activeJobs = (jobsData?.jobs ?? []).filter(
    (j) => j.status === "ACTIVE"
  );
  const selectedJob = activeJobs.find((j) => j.id === query.forJob);

  useDebouncedSearchSync(search, query.q, (s) =>
    onFiltersChange({ ...query, q: s, page: 1 })
  );

  const setFilters = (next: TalentSearchFilters) =>
    onFiltersChange({ ...next, q: search, page: 1 });
  const goToPage = (page: number) =>
    onFiltersChange({ ...query, q: search, page });
  const setForJob = (jobId: string | undefined) => {
    setSortByMatch(false);
    onFiltersChange({ ...query, forJob: jobId });
  };

  const inviteTalent = (talentId: string) => {
    if (!selectedJob) return;
    void runWithToast(
      () =>
        sendInvitation
          .mutateAsync({ jobId: selectedJob.id, talentId })
          .then(() =>
            setInvitedTalentIds((prev) => new Set(prev).add(talentId))
          ),
      {
        success: t("search.inviteSent"),
        error: t("search.inviteFailed"),
        onError: (err) =>
          err instanceof ApiError ? getErrorMessage(err) : undefined,
      }
    );
  };

  const talents = data?.talents ?? [];
  // Computed once per (talents page, selected job) instead of once for the sort
  // comparator and again per TalentCard render — same score, single source.
  const matchByTalentId = useMemo(() => {
    if (!selectedJob) return undefined;
    return new Map(
      talents.map((tal) => [tal.id, computeMatchScore(selectedJob, tal)])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talents, selectedJob?.id]);

  const displayedTalents =
    matchByTalentId && sortByMatch
      ? [...talents].sort(
          (a, b) =>
            (matchByTalentId.get(b.id)?.score ?? 0) -
            (matchByTalentId.get(a.id)?.score ?? 0)
        )
      : talents;
  const total = data?.pagination.total ?? 0;
  const pages = data?.pagination.pages ?? 1;

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-8">
      <h1 className="sr-only">{t("search.heading")}</h1>

      <div className="relative mb-6 flex h-12 items-center rounded-12 border border-neutral-200 bg-white px-4 shadow-[0_1px_2px_rgba(26,25,23,0.06)] focus-within:border-brand-600 focus-within:shadow-focus">
        <Search className="flex-shrink-0 text-neutral-400" size={17} />
        <input
          aria-label={t("search.ariaLabel")}
          className="flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          placeholder={t("search.placeholder")}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            aria-label={t("search.clear")}
            className="grid h-7 w-7 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
            onClick={() => setSearch("")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-8 sm:flex-row">
        <TalentFilterSidebar filters={query} onChange={setFilters} />

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              {isLoading ? (
                <>
                  <span className="text-neutral-900">
                    {t("search.loading")}
                  </span>
                  <Spinner className="h-3 w-3" />
                </>
              ) : (
                <>
                  <strong className="text-neutral-900">
                    {formatNumber(total)}
                  </strong>{" "}
                  {t("search.candidates", { count: total })}
                  {isFetching && <Spinner className="h-3 w-3" />}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              {t("search.rankAgainst")}
              <JobContextSelect
                jobs={activeJobs}
                value={selectedJob?.id}
                onChange={setForJob}
              />
              {selectedJob && (
                <button
                  className="rounded-4 text-[12px] text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
                  type="button"
                  onClick={() => setSortByMatch((v) => !v)}
                >
                  {sortByMatch ? t("search.sorted") : t("search.sortByMatch")}
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: TALENT_LIST_SKELETON_COUNT }, (_, i) => (
                <TalentCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              action={
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  {t("common.actions.retry")}
                </Button>
              }
              description={t("search.errorDesc")}
              title={t("search.errorTitle")}
            />
          ) : displayedTalents.length === 0 ? (
            <EmptyState
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onFiltersChange({ ...DEFAULT_TALENT_SEARCH_FILTERS })
                  }
                >
                  {t("common.actions.clearFilters")}
                </Button>
              }
              description={t("search.emptyDesc")}
              title={t("search.emptyTitle")}
            />
          ) : (
            <div
              className={cn(
                "space-y-2 transition-opacity duration-300",
                isPlaceholderData && "opacity-70"
              )}
            >
              {displayedTalents.map((talent) => (
                <TalentCard
                  invited={invitedTalentIds.has(talent.id)}
                  inviting={
                    sendInvitation.isPending &&
                    sendInvitation.variables?.talentId === talent.id
                  }
                  key={talent.id}
                  match={matchByTalentId?.get(talent.id)}
                  talent={talent}
                  onInvite={
                    selectedJob ? () => inviteTalent(talent.id) : undefined
                  }
                />
              ))}
            </div>
          )}

          {!isLoading && (
            <Pagination
              page={query.page}
              pages={pages}
              onPageChange={goToPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
