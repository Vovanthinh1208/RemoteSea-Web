/**
 * Warms a route's lazy chunk on hover/focus intent, so clicking a nav link
 * renders instantly instead of showing the Suspense fallback while ~15-35kB of
 * page JS downloads. Import specifiers are identical to AppRouter's lazy()
 * calls, so Vite resolves each pair to a single shared chunk and repeat hovers
 * hit the browser's module cache for free. Same idea as JobCard's detail-chunk
 * prefetch, extended to the navbar.
 */
const ROUTE_CHUNKS: Record<string, () => Promise<unknown>> = {
  "/jobs": () => import("@/features/jobs/pages/JobsPage"),
  "/salary": () => import("@/pages/SalaryPage"),
  "/community": () => import("@/pages/CommunityPage"),
  "/blog": () => import("@/pages/BlogPage"),
  "/saved": () => import("@/features/saved/pages/SavedJobsPage"),
};

export const prefetchRoute = (path: string): void => {
  void ROUTE_CHUNKS[path]?.();
};
