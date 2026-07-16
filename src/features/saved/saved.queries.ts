import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSavedJobIds, listSavedJobs, saveJob, unsaveJob } from "@/features/saved/saved.service";
import { useAuth } from "@/contexts/AuthContext";
import { savedKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

// Matches the backend's paginationQuerySchema max — keeps SavedJobsPage's "shows
// everything typical users have saved" feel without adding pager UI (a real
// "load more" control is a follow-up if saved-job counts regularly exceed this).
const SAVED_JOBS_LIST_LIMIT = 50;

export const useSavedJobs = (page = 1, limit = SAVED_JOBS_LIST_LIMIT) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedKeys.jobs(page, limit),
    queryFn: ({ signal }) => listSavedJobs(page, limit, { signal }),
    enabled: !!user,
    staleTime: TIER.live.staleTime,
  });
};

// Full membership set (job ids only), for "is this job saved?" checks — see
// useSavedJobToggle.ts. Deliberately not paginated; see savedKeys.ids()'s comment.
export const useSavedJobIds = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedKeys.ids(),
    queryFn: ({ signal }) => listSavedJobIds({ signal }),
    enabled: !!user,
    staleTime: TIER.live.staleTime,
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveJob,
    onMutate: async (jobId: string) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.ids() });
      const previous = queryClient.getQueryData<string[]>(savedKeys.ids());
      queryClient.setQueryData<string[]>(savedKeys.ids(), (old) => [...(old ?? []), jobId]);
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      if (context?.previous) queryClient.setQueryData(savedKeys.ids(), context.previous);
    },
    // Only the display lists (full job rows) need a refetch — the ids set was
    // optimistically set to exactly what the server now holds (both endpoints
    // are idempotent), so refetching it was a wasted request on every single
    // heart click. On error the rollback restores it and a refetch confirms.
    onSettled: (_data, error) => {
      if (error) void queryClient.invalidateQueries({ queryKey: savedKeys.ids() });
      void queryClient.invalidateQueries({ queryKey: savedKeys.jobsPrefix });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsaveJob,
    onMutate: async (jobId: string) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.ids() });
      const previous = queryClient.getQueryData<string[]>(savedKeys.ids());
      queryClient.setQueryData<string[]>(savedKeys.ids(), (old) =>
        (old ?? []).filter((id) => id !== jobId)
      );
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      if (context?.previous) queryClient.setQueryData(savedKeys.ids(), context.previous);
    },
    // Same invalidation policy as useSaveJob — see the comment there.
    onSettled: (_data, error) => {
      if (error) void queryClient.invalidateQueries({ queryKey: savedKeys.ids() });
      void queryClient.invalidateQueries({ queryKey: savedKeys.jobsPrefix });
    },
  });
};
