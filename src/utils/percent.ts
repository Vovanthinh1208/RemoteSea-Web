/**
 * `part` as a whole-number percentage of `total`, guarding divide-by-zero
 * (returns 0 when total is 0). This formula — `total ? round(part/total*100) : 0`
 * — was hand-written ~7 times across the talent and employer dashboards (funnel
 * bars, listing progress, interview rate); a forgotten guard would put
 * NaN/Infinity into a width style.
 */
export const percent = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 100) : 0;
