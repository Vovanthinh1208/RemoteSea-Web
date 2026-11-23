import type { RequestOptions } from "@/core/http/request-config";
import { cvAnalysisRepository } from "@/features/cv-analysis/cv-analysis.repository";
import { toCvAnalysis } from "@/features/cv-analysis/cv-analysis.mapper";
import type { CvAnalysis } from "@/types/cv-analysis";

export const getCachedCvAnalysis = async (
  applicationId: string,
  opts?: RequestOptions
): Promise<CvAnalysis | null> => {
  const cached = await cvAnalysisRepository.getCached(applicationId, opts);
  return cached ? toCvAnalysis(cached) : null;
};

export const getCvAnalysis = async (
  applicationId: string,
  opts?: RequestOptions
): Promise<CvAnalysis> =>
  toCvAnalysis(await cvAnalysisRepository.get(applicationId, opts));

export const regenerateCvAnalysis = async (
  applicationId: string
): Promise<CvAnalysis> =>
  toCvAnalysis(await cvAnalysisRepository.regenerate(applicationId));
