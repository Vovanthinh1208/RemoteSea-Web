import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SearchBar } from "@/features/jobs/components/SearchBar";
import { FilterSidebar } from "@/features/jobs/components/FilterSidebar";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobCardSkeleton } from "@/features/jobs/components/JobCardSkeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useJobsQuery, prefetchJobsList } from "@/features/jobs/jobs.queries";
import { useCategories } from "@/features/taxonomy/taxonomy.queries";
import {
  DEFAULT_FILTERS,
  SALARY_CEIL,
  SALARY_FLOOR,
  type Filters,
  type JobFilters,
  type SortKey,
} from "@/features/jobs/job-filters";
import { cn } from "@/utils/cn";
import { formatSalaryRange } from "@/utils/format";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";

interface JobsBoardProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

const TIMEZONE_LABELS: Record<string, string> = {
  sea: "SEA / APAC",
  async: "Async-friendly",
  SG: "SG-based",
  AU: "AU-based",
  US: "US-based",
};

const SEARCH_DEBOUNCE_MS = 400;
const JOB_LIST_SKELETON_COUNT = 6;

export const JobsBoard = ({ filters: query, onFiltersChange }: JobsBoardProps) => {
  const [search, setSearch] = useSyncedState(query.q);
  const firstRender = useRef(true);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, isError, isPlaceholderData, refetch } = useJobsQuery(query);
  const { data: categories } = useCategories();

  // Once a page's results are in, warm the cache for the next page — if the
  // user does click "next," it's often already there instead of triggering a
  // fresh fetch. Deliberately not the previous page: paging forward is far
  // more common than paging back.
  useEffect(() => {
    if (!data || query.page >= data.pagination.pages) return;
    void prefetchJobsList(queryClient, { ...query, page: query.page + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, queryClient]);

  // Debounced search → filters
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (search !== query.q) {
        // Mirrors the API's own default: ranks by relevance once a search
        // starts (unless the user already picked a different sort), and
        // reverts to recency once the search is cleared — never overrides an
        // explicit choice like "salary"/"featured".
        let sort = query.sort;
        if (search && query.sort === "recent") sort = "relevance";
        if (!search && query.sort === "relevance") sort = "recent";
        onFiltersChange({ ...query, q: search, sort, page: 1 });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setFilters = (filters: Filters) =>
    onFiltersChange({ ...query, filters, q: search, page: 1 });
  const setSort = (sort: SortKey) => onFiltersChange({ ...query, sort, q: search, page: 1 });
  const goToPage = (page: number) => onFiltersChange({ ...query, q: search, page });

  const { filters } = query;
  const activePills: { label: string; clear: () => void }[] = [];
  filters.jobType.forEach((v) =>
    activePills.push({
      label: v,
      clear: () => setFilters({ ...filters, jobType: filters.jobType.filter((x) => x !== v) }),
    })
  );
  filters.seniority.forEach((v) =>
    activePills.push({
      label: v,
      clear: () => setFilters({ ...filters, seniority: filters.seniority.filter((x) => x !== v) }),
    })
  );
  filters.timezone.forEach((v) =>
    activePills.push({
      label: TIMEZONE_LABELS[v] ?? v,
      clear: () => setFilters({ ...filters, timezone: filters.timezone.filter((x) => x !== v) }),
    })
  );
  filters.category.forEach((slug) =>
    activePills.push({
      label: categories?.find((c) => c.slug === slug)?.name ?? slug,
      clear: () => setFilters({ ...filters, category: filters.category.filter((x) => x !== slug) }),
    })
  );
  if (filters.salaryMin > SALARY_FLOOR || filters.salaryMax < SALARY_CEIL) {
    activePills.push({
      label: formatSalaryRange(filters.salaryMin, filters.salaryMax) ?? "",
      clear: () => setFilters({ ...filters, salaryMin: SALARY_FLOOR, salaryMax: SALARY_CEIL }),
    });
  }

  const jobs = data?.jobs ?? [];
  const total = data?.pagination.total ?? 0;
  const pages = data?.pagination.pages ?? 1;
  const facets = data?.facets ?? { jobType: {}, timezone: {}, seniority: {}, category: {} };

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-8">
      <h1 className="sr-only">Jobs</h1>
      <SearchBar value={search} onChange={setSearch} />

      <div className="flex flex-col gap-8 sm:flex-row">
        <FilterSidebar facets={facets} filters={filters} onChange={setFilters} />

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-3 flex items-center justify-between">
            {/* div, not p: Spinner renders a <div>, and a <div> can't be a
                descendant of <p> per the HTML spec (React flags this as a
                hydration-mismatch warning) — this line was never actual prose,
                just a status line, so div loses nothing semantically. */}
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              {isLoading ? (
                <>
                  <span className="text-neutral-900">Loading jobs… </span>
                  <Spinner className="h-3 w-3" />
                </>
              ) : (
                <>
                  <strong className="text-neutral-900">{total}</strong>{" "}
                  {total === 1 ? "job" : "jobs"}
                  <span className="text-neutral-400"> matching your filters</span>
                  {/* Background refetch (filter/sort/page change) over data
                      that's already on screen — isLoading only ever covers the
                      very first load, so this is the only signal for "still
                      showing the old page, new one's on its way." Spinner
                      alone, no "Updating…" label: the count/filters text right
                      next to it already reads as a full sentence, and a second
                      label crammed onto the same line just adds clutter the
                      spinner alone doesn't need. */}
                  {isFetching && <Spinner className="h-3 w-3" />}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              Sort by
              <select
                aria-label="Sort jobs"
                className="rounded-8 border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 outline-none focus:border-brand-600"
                value={query.sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                {query.q && <option value="relevance">Best match</option>}
                <option value="recent">Most recent</option>
                <option value="salary">Highest salary</option>
                <option value="featured">Featured first</option>
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {activePills.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activePills.map((p, i) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12px] text-neutral-700"
                  key={`${p.label}-${i}`}
                >
                  {p.label}
                  <button
                    aria-label={`Remove filter: ${p.label}`}
                    className="text-neutral-400 hover:text-neutral-700"
                    onClick={p.clear}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Job list — a filter/page/sort change keeps showing the previous
              page's results (keepPreviousData) while the new ones load, only
              lightly dimmed and still interactive (see the "Updating…"
              indicator above for the actual loading signal) instead of
              locking the whole list, so a click that lands mid-refetch still
              does something instead of hitting a dead area. */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: JOB_LIST_SKELETON_COUNT }, (_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              action={
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              }
              description="Something went wrong fetching listings."
              title="Couldn't load jobs"
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              action={
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Clear filters
                  </Button>
                  <Link
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                    to={ROUTES.alerts}
                  >
                    Create a job alert instead
                  </Link>
                </div>
              }
              description="Try removing a filter, or get notified the moment a matching job goes live."
              title="No jobs match these filters"
            />
          ) : (
            <div
              className={cn(
                "space-y-2 transition-opacity duration-300",
                isPlaceholderData && "opacity-70"
              )}
            >
              {jobs.map((job) => (
                <JobCard job={job} key={job.id} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5">
              <button
                aria-label="Previous page"
                className="grid h-9 w-9 place-items-center rounded-8 border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
                disabled={query.page <= 1}
                onClick={() => goToPage(query.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  aria-current={n === query.page ? "page" : undefined}
                  onClick={() => goToPage(n)}
                  className={cn(
                    "grid h-9 min-w-9 place-items-center rounded-8 px-2 text-sm transition-colors",
                    n === query.page
                      ? "bg-brand-600 font-medium text-white"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                aria-label="Next page"
                className="grid h-9 w-9 place-items-center rounded-8 border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
                disabled={query.page >= pages}
                onClick={() => goToPage(query.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
