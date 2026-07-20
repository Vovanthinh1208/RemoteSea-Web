import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SearchBar } from "@/features/jobs/components/SearchBar";
import { FilterSidebar } from "@/features/jobs/components/FilterSidebar";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobCardSkeleton } from "@/features/jobs/components/JobCardSkeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useJobsQuery } from "@/features/jobs/jobs.queries";
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
  const { data, isLoading, isError, isPlaceholderData, refetch } = useJobsQuery(query);
  const { data: categories } = useCategories();

  // Debounced search → filters
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
            <p className="text-sm text-neutral-600">
              {isLoading ? (
                "Loading jobs…"
              ) : (
                <>
                  <strong className="text-neutral-900">{total}</strong>{" "}
                  {total === 1 ? "job" : "jobs"}
                  <span className="text-neutral-400"> matching your filters</span>
                </>
              )}
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              Sort by
              <select
                aria-label="Sort jobs"
                className="rounded-8 border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 outline-none focus:border-brand-600"
                value={query.sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
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

          {/* Job list — dimmed while a filter/page change is fetching over
              kept-previous data, so the click visibly "took" instead of the old
              results sitting there unchanged with no feedback. */}
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
                <Button size="sm" variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Clear filters
                </Button>
              }
              description="Try removing a filter or set up an alert for when something fits."
              title="No jobs match these filters"
            />
          ) : (
            <div
              className={cn(
                "space-y-2 transition-opacity duration-150",
                isPlaceholderData && "pointer-events-none opacity-60"
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
