import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useCategories } from "@/features/taxonomy/taxonomy.queries";
import { FilterGroup } from "@/components/shared/FilterGroup";
import { CheckRow } from "@/components/shared/CheckRow";
import {
  DEFAULT_FILTERS,
  FILTER_OPTIONS,
  SALARY_CEIL,
  SALARY_FLOOR,
  countActiveFilters,
  type Filters,
} from "@/features/jobs/job-filters";
import type { JobFacets } from "@/types/job";
import { useTranslation } from "@/i18n/useTranslation";
import { filterValueLabel } from "@/features/jobs/jobs.utils";

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  facets: JobFacets;
}

const TIMEZONE_KEYS = ["sea", "async", "SG", "AU", "US"] as const;
const SENIORITY_KEYS = ["Entry", "Mid", "Senior"] as const;

const SALARY_STEP = 100;
const SALARY_GAP = 500;

export const FilterSidebar = ({
  filters,
  onChange,
  facets,
}: FilterSidebarProps) => {
  const { t, formatNumber } = useTranslation("jobs");
  const { data: categories } = useCategories();
  const activeCount = countActiveFilters(filters);
  // Mobile only — on sm+ the groups below are always visible (this state is
  // simply never consulted there, via sm:!block). Without this, five filter
  // groups (job type, timezone, a salary range with two sliders, seniority,
  // category — 20+ checkboxes) rendered full-height, inline, *above* the job
  // list on a phone: a mobile visitor had to scroll past all of them before
  // seeing a single job.
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (
    key: keyof Pick<Filters, "jobType" | "timezone" | "category" | "seniority">,
    val: string
  ) => {
    const current = filters[key];
    onChange({
      ...filters,
      [key]: current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val],
    });
  };

  // Local salary state so dragging the sliders doesn't refetch per step; commit on release.
  const [salaryMin, setSalaryMin] = useSyncedState(filters.salaryMin);
  const [salaryMax, setSalaryMax] = useSyncedState(filters.salaryMax);

  const commitSalary = () => onChange({ ...filters, salaryMin, salaryMax });

  const slugForCategoryName = (name: string) =>
    categories?.find((c) => c.name === name)?.slug;

  return (
    <aside className="w-full flex-shrink-0 sm:w-[220px]">
      <div className="flex items-center justify-between">
        <button
          aria-controls="job-filter-groups"
          aria-expanded={mobileOpen}
          className="-my-1 flex items-center gap-2 rounded-8 py-1 focus-visible:shadow-focus focus-visible:outline-none sm:pointer-events-none"
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <h3 className="text-[15px] font-semibold text-neutral-900">
            {t("filters.title")}
          </h3>
          {activeCount > 0 && (
            <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform sm:hidden",
              mobileOpen && "rotate-180"
            )}
          />
        </button>
        <button
          type="button"
          className={cn(
            "rounded-4 text-[12px] text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none",
            activeCount > 0 ? "visible pt-[3px]" : "invisible"
          )}
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          {t("filters.clearAll")}
        </button>
      </div>
      <div
        className={cn(mobileOpen ? "block" : "hidden", "sm:!block")}
        id="job-filter-groups"
      >
        <FilterGroup label={t("filters.jobType")}>
          {FILTER_OPTIONS.jobType.map((v) => (
            <CheckRow
              checked={filters.jobType.includes(v)}
              count={facets.jobType[v] ?? 0}
              key={v}
              label={filterValueLabel(v)}
              onToggle={() => toggle("jobType", v)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filters.timezone")}>
          {TIMEZONE_KEYS.map((key) => (
            <CheckRow
              checked={filters.timezone.includes(key)}
              count={facets.timezone[key] ?? 0}
              key={key}
              label={t(`tzOption.${key}`)}
              onToggle={() => toggle("timezone", key)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filters.salary")}>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[12px] text-neutral-500">
              <span>${formatNumber(salaryMin)}</span>
              <span>
                ${formatNumber(salaryMax)}
                {salaryMax >= SALARY_CEIL ? "+" : ""}
                {t("filters.perMonthSuffix")}
              </span>
            </div>
            <input
              aria-label={t("filters.minSalary")}
              className="w-full accent-brand-600"
              max={SALARY_CEIL}
              min={SALARY_FLOOR}
              step={SALARY_STEP}
              type="range"
              value={salaryMin}
              onChange={(e) =>
                setSalaryMin(Math.min(+e.target.value, salaryMax - SALARY_GAP))
              }
              onKeyUp={commitSalary}
              onMouseUp={commitSalary}
              onTouchEnd={commitSalary}
            />
            <input
              aria-label={t("filters.maxSalary")}
              className="w-full accent-brand-600"
              max={SALARY_CEIL}
              min={SALARY_FLOOR}
              step={SALARY_STEP}
              type="range"
              value={salaryMax}
              onChange={(e) =>
                setSalaryMax(Math.max(+e.target.value, salaryMin + SALARY_GAP))
              }
              onKeyUp={commitSalary}
              onMouseUp={commitSalary}
              onTouchEnd={commitSalary}
            />
          </div>
        </FilterGroup>

        <FilterGroup label={t("filters.seniority")}>
          {SENIORITY_KEYS.map((key) => (
            <CheckRow
              checked={filters.seniority.includes(key)}
              count={facets.seniority[key] ?? 0}
              key={key}
              label={t(`seniorityOption.${key}`)}
              onToggle={() => toggle("seniority", key)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filters.category")}>
          {FILTER_OPTIONS.category.map((name) => {
            const slug = slugForCategoryName(name);
            return (
              <CheckRow
                checked={!!slug && filters.category.includes(slug)}
                count={facets.category[name] ?? 0}
                key={name}
                label={filterValueLabel(name)}
                onToggle={() => slug && toggle("category", slug)}
              />
            );
          })}
        </FilterGroup>
      </div>
    </aside>
  );
};
