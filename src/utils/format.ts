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
