import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listSavedJobIds,
  listSavedJobs,
  saveJob,
  unsaveJob,
  type SavedJobListResponse,
} from "@/features/saved/saved.service";
import { useAuth } from "@/contexts/AuthContext";
import { savedKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

// Matches the backend's paginationQuerySchema max — keeps SavedJobsPage's "shows
// everything typical users have saved" feel without adding pager UI (a real
// "load more" control is a follow-up if saved-job counts regularly exceed this).
const SAVED_JOBS_LIST_LIMIT = 50;

export const useSavedJobs = (
  page = 1,
  limit = SAVED_JOBS_LIST_LIMIT
) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedKeys.jobs(page, limit),
    queryFn: ({ signal }) => listSavedJobs(page, limit, { signal }),
    enabled: !!user,
    ...TIER.live,
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
    ...TIER.live,
  });
};

// Fine-grained membership subscription for a single card: `select` narrows the
// cached ids array down to one boolean, so React Query only re-renders this
// observer when *its own* saved-state flips. Subscribing to the raw array (as
// useSavedJobIds does) re-rendered every JobCard on the board on every toggle,
// because the array identity changes for all of them at once.
export const useIsJobSaved = (jobId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedKeys.ids(),
    queryFn: ({ signal }) => listSavedJobIds({ signal }),
    enabled: !!user,
    ...TIER.live,
    select: (ids) => ids.includes(jobId),
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveJob,
    onMutate: async (jobId: string) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.ids() });
      const previous = queryClient.getQueryData<string[]>(
        savedKeys.ids()
      );
      queryClient.setQueryData<string[]>(savedKeys.ids(), (old) => [
        ...(old ?? []),
        jobId,
      ]);
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      if (context?.previous)
        queryClient.setQueryData(savedKeys.ids(), context.previous);
    },
    // Only the display lists (full job rows) need a refetch — the ids set was
    // optimistically set to exactly what the server now holds (both endpoints
    // are idempotent), so refetching it was a wasted request on every single
    // heart click. On error the rollback restores it and a refetch confirms.
    onSettled: (_data, error) => {
      if (error)
        void queryClient.invalidateQueries({
          queryKey: savedKeys.ids(),
        });
      void queryClient.invalidateQueries({
        queryKey: savedKeys.jobsPrefix,
      });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsaveJob,

    onMutate: async (jobId: string) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: savedKeys.ids() }),
        queryClient.cancelQueries({ queryKey: savedKeys.jobsPrefix }),
      ]);

      const previousIds = queryClient.getQueryData<string[]>(
        savedKeys.ids()
      );
      const previousLists =
        queryClient.getQueriesData<SavedJobListResponse>({
          queryKey: savedKeys.jobsPrefix,
        });

      queryClient.setQueryData<string[]>(savedKeys.ids(), (old) =>
        (old ?? []).filter((id) => id !== jobId)
      );

      queryClient.setQueriesData<SavedJobListResponse>(
        { queryKey: savedKeys.jobsPrefix },
        (old) => {
          if (!old) return old;

          const newSavedJobs = old.savedJobs.filter(
            (job) => job.jobId !== jobId
          );

          return {
            ...old,
            savedJobs: newSavedJobs,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          };
        }
      );

      return { previousIds, previousLists };
    },

    onError: (_err, _jobId, context) => {
      if (!context) return;

      queryClient.setQueryData(savedKeys.ids(), context.previousIds);

      context.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: (_data, error) => {
      if (error) {
        void queryClient.invalidateQueries({
          queryKey: savedKeys.ids(),
        });
        void queryClient.invalidateQueries({
          queryKey: savedKeys.jobsPrefix,
        });
      }
    },
  });
};
