/**
 * The one salary-range formatter. This was re-implemented inline ~9 times with
 * diverging null handling — two pages rendered "$0–0" for jobs/profiles with no
 * salary (`(min ?? 0).toLocaleString()`), admin rendered "Not specified", and
 * the rest assumed values exist. Returns null when no bound is present so each
 * caller chooses its own empty copy (or hides the element) explicitly.
 */
export const formatSalaryRange = (
  min: number | null | undefined,
  max: number | null | undefined,
  opts: { prefix?: string } = {}
): string | null => {
  const prefix = opts.prefix ?? "$";
  if (min != null && max != null)
    return `${prefix}${min.toLocaleString()}–${max.toLocaleString()}`;
  if (min != null) return `${prefix}${min.toLocaleString()}+`;
  if (max != null) return `Up to ${prefix}${max.toLocaleString()}`;
  return null;
};

/**
 * A whole-dollar USD amount with a thousands separator — "$1,200". Plan prices
 * were rendered as bare `${price}` in the post-job flow ("$1200") but
 * toLocaleString'd on the pricing page ("$1,200"); the same number showed two
 * ways. This is the one formatter for those.
 */
export const formatUsd = (amount: number): string =>
  `$${amount.toLocaleString()}`;

const HOURS_PER_DAY = 24;

/**
 * Shared by the employer's own private SLA tile (EmployerDashboard) and the
 * public per-employer stat on the job detail page — hours read awkwardly
 * past a day ("42h"), so this switches to days once the average crosses
 * HOURS_PER_DAY. `hours === 0` renders as "—" rather than "0h": the backend
 * collapses "no data" to 0 in the private aggregate, so 0 is ambiguous with
 * "responds instantly" and must not be shown as a real number.
 */
export const formatResponseTime = (hours: number): string => {
  if (hours === 0) return "—";
  if (hours < HOURS_PER_DAY) return `${Math.round(hours)}h`;
  return `${Math.round((hours / HOURS_PER_DAY) * 10) / 10}d`;
};

/**
 * A work-experience start/end date as "Jan 2024" — was defined identically
 * in both PublicTalentProfilePage.tsx and profile-form/ExperienceSection.tsx
 * (the display and edit views of the same experience data). UTC, not local
 * time zone: these are month/year-only values with no real day-of-month
 * meaning, so a local-time read near a month boundary shouldn't be able to
 * shift which month renders.
 */
export const formatMonthYear = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * A work-experience span as "2 yrs 3 mo" (falls back to "< 1 mo"). Only
 * used on the public profile page today, but generic enough — and close
 * enough in kind to formatMonthYear above — to live here rather than as a
 * page-local helper.
 */
export const formatDuration = (
  startIso: string,
  endIso: string | null
): string => {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date();
  const totalMonths = Math.max(
    0,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      (end.getUTCMonth() - start.getUTCMonth())
  );
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return (
    [
      years ? `${years} yr${years > 1 ? "s" : ""}` : null,
      months ? `${months} mo` : null,
    ]
      .filter(Boolean)
      .join(" ") || "< 1 mo"
  );
};
