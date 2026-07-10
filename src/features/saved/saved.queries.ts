import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSavedJobs, saveJob, unsaveJob, type SavedJob } from "@/features/saved/saved.service";
import { useAuth } from "@/contexts/AuthContext";
import { savedKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

// Hierarchical (matches the rest of the app's ["feature", "scope"] convention)
// rather than a flat string, so a future feature can invalidate by ["saved"]
// prefix if more saved-* queries are ever added.
export const SAVED_JOBS_KEY = savedKeys.jobs();

export const useSavedJobs = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedKeys.jobs(),
    queryFn: ({ signal }) => listSavedJobs({ signal }),
    enabled: !!user,
    staleTime: TIER.live.staleTime,
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveJob,
    onMutate: async (jobId: string) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.jobs() });
      const previous = queryClient.getQueryData<SavedJob[]>(savedKeys.jobs());
      // Placeholder only — mutationFn only gives us the jobId, not the full SavedJob
      // shape. Safe because current consumers only read `.jobId` (membership) and
      // `.length`; onSettled's invalidate replaces this with the real row shortly after.
      queryClient.setQueryData<SavedJob[]>(savedKeys.jobs(), (old) => [
        ...(old ?? []),
        { jobId } as SavedJob,
      ]);
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      if (context?.previous) queryClient.setQueryData(savedKeys.jobs(), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.jobs() });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsaveJob,
    onMutate: async (jobId: string) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.jobs() });
      const previous = queryClient.getQueryData<SavedJob[]>(savedKeys.jobs());
      queryClient.setQueryData<SavedJob[]>(savedKeys.jobs(), (old) =>
        (old ?? []).filter((s) => s.jobId !== jobId)
      );
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      if (context?.previous) queryClient.setQueryData(savedKeys.jobs(), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.jobs() });
    },
  });
};
