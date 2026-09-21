import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCvAnalysis,
  regenerateCvAnalysis,
} from "@/features/cv-analysis/cv-analysis.service";
import { cvAnalysisKeys } from "@/core/query/query-keys";

// enabled: false — this GET is not a cheap read, it's a real (billed) LLM
// call the first time it runs for a given application (a few seconds; the
// backend caches after that). Firing it implicitly for every row in a list
// would silently rack up LLM cost/latency just from an employer scrolling
// past applicants — it only ever runs when the caller explicitly kicks off
// analysis (see CvAnalysisCard's "Analyze with AI" button) via refetch().
// staleTime: Infinity because nothing auto-invalidates this — the only way
// it changes is the recruiter explicitly clicking Regenerate (see below),
// which writes the new result straight into this same cache entry rather
// than invalidating it.
export const useCvAnalysis = (applicationId: string) =>
  useQuery({
    queryKey: cvAnalysisKeys.detail(applicationId),
    queryFn: ({ signal }) => getCvAnalysis(applicationId, { signal }),
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

// Explicit "run this again" action (CvAnalysisCard's Regenerate button) —
// always calls the LLM, even if useCvAnalysis already has a cached result.
export const useRegenerateCvAnalysis = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateCvAnalysis(applicationId),
    onSuccess: (data) => {
      // Write straight into useCvAnalysis's cache entry instead of
      // invalidating it — invalidating a staleTime: Infinity, enabled: false
      // query doesn't trigger a refetch on its own, it would just leave the
      // card showing the old data until something else happened to remount.
      queryClient.setQueryData(cvAnalysisKeys.detail(applicationId), data);
    },
  });
};
