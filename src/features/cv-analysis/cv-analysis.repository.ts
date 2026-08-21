import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { CvAnalysisDto } from "@/features/cv-analysis/cv-analysis.dto";

// Employer-only, same reasoning as scorecard.repository.ts — internal hiring
// aid, never shown to the talent, so there's no role-branching path.
export const cvAnalysisRepository = {
  get: async (
    applicationId: string,
    opts?: RequestOptions
  ): Promise<CvAnalysisDto> => {
    const { data } = await apiClient.get<CvAnalysisDto>(
      `/employer/applications/${applicationId}/ai-cv-analysis`,
      { signal: opts?.signal }
    );
    return data;
  },
};
