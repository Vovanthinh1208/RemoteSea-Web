import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  createJob,
  getJob,
  listJobs,
} from "@/features/jobs/jobs.service";
import {
  JOB_LIMIT,
  type JobFilters,
} from "@/features/jobs/job-filters";
import { jobKeys, employerKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

export const useJobsQuery = (
  filters: JobFilters,
  limit: number = JOB_LIMIT
) =>
  useQuery({
    queryKey: jobKeys.list(filters, limit),
    queryFn: ({ signal }) => listJobs(filters, limit, { signal }),
    placeholderData: keepPreviousData,
    ...TIER.list,
  });

export const useJobQuery = (id: string | undefined) =>
  useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: ({ signal }) => getJob(id as string, { signal }),
    enabled: !!id,
    ...TIER.list,
  });

// Job-board -> job-detail is the single most common navigation in the app; prefetching
// on hover means the detail page's data is often already cached by the time the click
// lands. Exported here (not called directly from JobCard.tsx) so components never need
// to import the service layer just to prefetch.
// The route *chunk* prefetch lives in router/route-prefetch.ts (JobCard calls
// both) — importing the page from here made the data layer depend on the view
// layer and created a queries -> page -> queries cycle.
export const prefetchJob = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: jobKeys.detail(id),
    queryFn: ({ signal }) => getJob(id, { signal }),
    ...TIER.list,
  });

// JobsBoard calls this once a page's results have loaded, for the next page
// only (not previous — a user paging forward is far more likely than paging
// back). Same cache the click itself would read from, so if the prefetch
// wins the race the click resolves instantly instead of showing a spinner.
export const prefetchJobsList = (
  queryClient: QueryClient,
  filters: JobFilters,
  limit: number = JOB_LIMIT
) =>
  queryClient.prefetchQuery({
    queryKey: jobKeys.list(filters, limit),
    queryFn: ({ signal }) => listJobs(filters, limit, { signal }),
    ...TIER.list,
  });

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      // Without this, a newly-posted job can be missing from the employer's own
      // dashboard (if it was cached earlier this session) for up to staleTime.
      queryClient.invalidateQueries({
        queryKey: employerKeys.jobs(),
      });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
};
