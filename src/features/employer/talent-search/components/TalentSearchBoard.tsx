import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { TalentFilterSidebar } from "@/features/employer/talent-search/components/TalentFilterSidebar";
import { TalentCard } from "@/features/employer/talent-search/components/TalentCard";
import { TalentCardSkeleton } from "@/features/employer/talent-search/components/TalentCardSkeleton";
import { JobContextSelect } from "@/features/employer/talent-search/components/JobContextSelect";
import { Pagination } from "@/features/jobs/components/Pagination";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useTalentSearchQuery } from "@/features/employer/talent-search/talent-search.queries";
import { useEmployerJobs } from "@/features/employer/employer.queries";
import { computeMatchScore } from "@/features/matching/match.util";
import {
  DEFAULT_TALENT_SEARCH_FILTERS,
  type TalentSearchFilters,
} from "@/features/employer/talent-search/talent-search.filters";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

interface TalentSearchBoardProps {
  filters: TalentSearchFilters;
  onFiltersChange: (filters: TalentSearchFilters) => void;
}

const SEARCH_DEBOUNCE_MS = 400;
const TALENT_LIST_SKELETON_COUNT = 6;

export const TalentSearchBoard = ({
  filters: query,
  onFiltersChange,
}: TalentSearchBoardProps) => {
  const [search, setSearch] = useSyncedState(query.q);
  const [sortByMatch, setSortByMatch] = useState(false);
  const firstRender = useRef(true);
  const { data, isLoading, isFetching, isError, isPlaceholderData, refetch } =
    useTalentSearchQuery(query);
  const { data: jobsData } = useEmployerJobs();
  const activeJobs = (jobsData?.jobs ?? []).filter(
    (j) => j.status === "ACTIVE"
  );
  const selectedJob = activeJobs.find((j) => j.id === query.forJob);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (search !== query.q) onFiltersChange({ ...query, q: search, page: 1 });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setFilters = (next: TalentSearchFilters) =>
    onFiltersChange({ ...next, q: search, page: 1 });
  const goToPage = (page: number) =>
    onFiltersChange({ ...query, q: search, page });
  const setForJob = (jobId: string | undefined) => {
    setSortByMatch(false);
    onFiltersChange({ ...query, forJob: jobId });
  };

  const talents = data?.talents ?? [];
  // Computed once per (talents page, selected job) instead of once for the sort
  // comparator and again per TalentCard render — same score, single source.
  const matchByTalentId = useMemo(() => {
    if (!selectedJob) return undefined;
    return new Map(
      talents.map((t) => [t.id, computeMatchScore(selectedJob, t)])
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
      <h1 className="sr-only">Find talent</h1>

      <div className="relative mb-6 flex h-12 items-center rounded-12 border border-neutral-200 bg-white px-4 shadow-[0_1px_2px_rgba(26,25,23,0.06)] focus-within:border-brand-600 focus-within:shadow-focus">
        <Search className="flex-shrink-0 text-neutral-400" size={17} />
        <input
          aria-label="Search candidates"
          className="flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          placeholder='Search by headline or name — e.g. "backend engineer"'
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            aria-label="Clear search"
            className="grid h-7 w-7 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
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
                  <span className="text-neutral-900">Loading candidates… </span>
                  <Spinner className="h-3 w-3" />
                </>
              ) : (
                <>
                  <strong className="text-neutral-900">{total}</strong>{" "}
                  {total === 1 ? "candidate" : "candidates"}
                  {isFetching && <Spinner className="h-3 w-3" />}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              Rank against
              <JobContextSelect
                jobs={activeJobs}
                value={selectedJob?.id}
                onChange={setForJob}
              />
              {selectedJob && (
                <button
                  className="text-[12px] text-brand-600 transition-colors hover:text-brand-700"
                  type="button"
                  onClick={() => setSortByMatch((v) => !v)}
                >
                  {sortByMatch
                    ? "✓ Sorted by match"
                    : "Sort this page by match"}
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
                  Try again
                </Button>
              }
              description="Something went wrong fetching candidates."
              title="Couldn't load candidates"
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
                  Clear filters
                </Button>
              }
              description="Try removing a filter — only candidates who've opted into 'Open to work' are shown."
              title="No candidates match these filters"
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
                  key={talent.id}
                  match={matchByTalentId?.get(talent.id)}
                  talent={talent}
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
