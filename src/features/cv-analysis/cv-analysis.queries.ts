import { useQuery } from "@tanstack/react-query";
import { getCvAnalysis } from "@/features/cv-analysis/cv-analysis.service";
import { cvAnalysisKeys } from "@/core/query/query-keys";

// enabled: false — this GET is not a cheap read, it's a real (billed) LLM
// call the first time it runs for a given application (a few seconds; the
// backend caches after that). Firing it implicitly for every row in a list
// would silently rack up LLM cost/latency just from an employer scrolling
// past applicants — it only ever runs when the caller explicitly kicks off
// analysis (see CvAnalysisCard's "Analyze with AI" button) via refetch().
// staleTime: Infinity because the result never changes once generated (see
// CvAnalysis's schema comment — no invalidation path, resumeUrl is immutable
// once applied), so there's nothing to silently go stale.
export const useCvAnalysis = (applicationId: string) =>
  useQuery({
    queryKey: cvAnalysisKeys.detail(applicationId),
    queryFn: ({ signal }) => getCvAnalysis(applicationId, { signal }),
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
