import { QueryClient } from "@tanstack/react-query";

const MINUTE_MS = 60_000;

// Tiered staleTime/gcTime, replacing today's single global default + ad hoc per-file
// overrides. Every value here matches a value that already existed somewhere in the
// codebase before this refactor — nothing gets a new implicit default it didn't have.
export const TIER = {
  // Rarely-changing lookup data (categories, skills, salary benchmarks) — matches
  // taxonomy.queries.ts/salary.queries.ts's existing 5-minute staleTime.
  reference: { staleTime: 5 * MINUTE_MS, gcTime: 5 * MINUTE_MS },
  // Default for most paginated/list/detail queries — matches today's global default.
  list: { staleTime: MINUTE_MS, gcTime: 5 * MINUTE_MS },
  // The auth session — must not silently go stale; matches AuthContext's existing value.
  session: { staleTime: Infinity, gcTime: Infinity },
  // Data the user expects to see reflect their own actions almost immediately
  // (saved jobs, employer's own application counts) — matches saved.queries.ts today.
  live: { staleTime: 30_000, gcTime: 5 * MINUTE_MS },
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TIER.list.staleTime,

      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
