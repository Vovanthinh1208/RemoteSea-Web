import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCvAnalysis,
  getCachedCvAnalysis,
  regenerateCvAnalysis,
} from "@/features/cv-analysis/cv-analysis.service";
import { cvAnalysisKeys } from "@/core/query/query-keys";

// Read persisted results on mount/refresh. Generation remains an explicit
// action so simply opening a workspace never spends provider tokens.
export const useCvAnalysis = (applicationId: string) => {
  const queryClient = useQueryClient();
  const cached = useQuery({
    queryKey: cvAnalysisKeys.detail(applicationId),
    queryFn: ({ signal }) => getCachedCvAnalysis(applicationId, { signal }),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const generate = useMutation({
    mutationFn: () => getCvAnalysis(applicationId),
    onSuccess: (data) => {
      queryClient.setQueryData(cvAnalysisKeys.detail(applicationId), data);
    },
  });
  return {
    ...cached,
    isFetching: cached.isFetching || generate.isPending,
    fetchStatus: generate.isPending ? "fetching" : cached.fetchStatus,
    isError: cached.isError || generate.isError,
    error: generate.error ?? cached.error,
    refetch: () => {
      if (cached.isError) void cached.refetch();
      else generate.mutate();
    },
  };
};

// Explicit "run this again" action (CvAnalysisCard's Regenerate button) —
// always calls the LLM, even if useCvAnalysis already has a cached result.
export const useRegenerateCvAnalysis = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateCvAnalysis(applicationId),
    onSuccess: (data) => {
      // Keep the persisted cache read and the visible card synchronized.
      queryClient.setQueryData(cvAnalysisKeys.detail(applicationId), data);
    },
  });
};
