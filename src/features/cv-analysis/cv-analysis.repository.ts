import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { CvAnalysisDto } from "@/features/cv-analysis/cv-analysis.dto";

// The backend chains a resume download (its own 10s budget, see
// resume-extraction.service.ts), PDF text extraction, and an AI completion
// call before this responds — comfortably able to exceed axios's global 15s
// default (http-client.ts) on a normal-sized CV, not just a pathological one.
// Same category of fix as ai-chat.repository.ts's SEND_MESSAGE_TIMEOUT_MS:
// without it, a slow-but-successful run times out client-side, and the
// retry policy (retry-policy.ts) treats that timeout as a retryable network
// error — silently firing a second (billed) AI call for the same analysis
// instead of just waiting for the first one to finish.
const CV_ANALYSIS_TIMEOUT_MS = 45_000;

// Employer-only, same reasoning as scorecard.repository.ts — internal hiring
// aid, never shown to the talent, so there's no role-branching path.
export const cvAnalysisRepository = {
  get: async (
    applicationId: string,
    opts?: RequestOptions
  ): Promise<CvAnalysisDto> => {
    const { data } = await apiClient.get<CvAnalysisDto>(
      `/employer/applications/${applicationId}/ai-cv-analysis`,
      { signal: opts?.signal, timeout: CV_ANALYSIS_TIMEOUT_MS }
    );
    return data;
  },

  // Always calls the LLM and overwrites the cached row — see
  // CvAnalysisService.regenerate on the backend.
  regenerate: async (applicationId: string): Promise<CvAnalysisDto> => {
    const { data } = await apiClient.post<CvAnalysisDto>(
      `/employer/applications/${applicationId}/ai-cv-analysis/regenerate`,
      undefined,
      { timeout: CV_ANALYSIS_TIMEOUT_MS }
    );
    return data;
  },
};
