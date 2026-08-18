import { timeAgoShort } from "@/utils/time";
import { formatSalaryRange } from "@/utils/format";
import {
  SALARY_CEIL,
  SALARY_FLOOR,
  type Filters,
} from "@/features/jobs/job-filters";
import type { Category } from "@/types/job";

export { LEVEL_LABELS, JOB_TYPE_LABELS } from "@/utils/labels";
// Moved to src/utils (used by talent, post-job, and the home page too) —
// re-exported here so existing jobs-feature imports keep working.
export { countryFlag } from "@/utils/color";

export const isAsyncTimezone = (timezone: string | null): boolean =>
  timezone?.toLowerCase().includes("async") ?? false;

// Mirrors the API's jobs/job-verification.util.ts (the auto-approval gate for
// verified employers) — deliberate duplication, same tradeoff as this file's
// own TIMEZONE_LABELS-style constants living in both repos. JobListItem (the
// board's card payload) doesn't carry `description`, so that criterion is
// skipped when absent rather than fetched separately — JobHeaderCard (detail
// page, which does have it) still gets the full 4-criteria check.
const MIN_DESCRIPTION_LENGTH = 100;

type VerifiableJob = {
  description?: string;
  salaryMin: number | null;
  categories: unknown[];
  employer: { isVerified: boolean };
};

export const isVerifiedJob = (job: VerifiableJob): boolean =>
  job.employer.isVerified &&
  job.salaryMin != null &&
  job.categories.length > 0 &&
  (job.description === undefined ||
    job.description.length >= MIN_DESCRIPTION_LENGTH);

export const MS_PER_DAY = 86_400_000;

export const timeAgo = timeAgoShort;

export const TIMEZONE_LABELS: Record<string, string> = {
  sea: "SEA / APAC",
  async: "Async-friendly",
  SG: "SG-based",
  AU: "AU-based",
  US: "US-based",
};

export type ActiveFilterPill = { label: string; clear: () => void };

// Pulled out of JobsBoard so the "which filter produced which removable pill"
// mapping is one pure, independently testable function instead of 30+ lines
// of array-building living inside the render body.
export const buildActivePills = (
  filters: Filters,
  categories: Pick<Category, "slug" | "name">[] | undefined,
  onChange: (filters: Filters) => void
): ActiveFilterPill[] => {
  const pills: ActiveFilterPill[] = [];

  filters.jobType.forEach((v) =>
    pills.push({
      label: v,
      clear: () =>
        onChange({
          ...filters,
          jobType: filters.jobType.filter((x) => x !== v),
        }),
    })
  );
  filters.seniority.forEach((v) =>
    pills.push({
      label: v,
      clear: () =>
        onChange({
          ...filters,
          seniority: filters.seniority.filter((x) => x !== v),
        }),
    })
  );
  filters.timezone.forEach((v) =>
    pills.push({
      label: TIMEZONE_LABELS[v] ?? v,
      clear: () =>
        onChange({
          ...filters,
          timezone: filters.timezone.filter((x) => x !== v),
        }),
    })
  );
  filters.category.forEach((slug) =>
    pills.push({
      label: categories?.find((c) => c.slug === slug)?.name ?? slug,
      clear: () =>
        onChange({
          ...filters,
          category: filters.category.filter((x) => x !== slug),
        }),
    })
  );
  if (filters.salaryMin > SALARY_FLOOR || filters.salaryMax < SALARY_CEIL) {
    pills.push({
      label: formatSalaryRange(filters.salaryMin, filters.salaryMax) ?? "",
      clear: () =>
        onChange({
          ...filters,
          salaryMin: SALARY_FLOOR,
          salaryMax: SALARY_CEIL,
        }),
    });
  }

  return pills;
};
