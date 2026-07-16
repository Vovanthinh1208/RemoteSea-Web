/**
 * Warms the lazy JobDetailPage chunk on hover intent. Lives in the jobs
 * feature (not router/route-prefetch) on purpose: JobCard importing the
 * router's full page map created component -> router -> pages -> component
 * cycles. This module knows about exactly one page — the one this feature
 * owns. Same import specifier as the router's lazy(), so Vite dedupes both
 * to a single chunk.
 */
export const prefetchJobDetailChunk = (): void => {
  void import("@/features/jobs/pages/JobDetailPage");
};
