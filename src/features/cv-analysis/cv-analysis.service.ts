import type { RequestOptions } from "@/core/http/request-config";
import { cvAnalysisRepository } from "@/features/cv-analysis/cv-analysis.repository";
import { toCvAnalysis } from "@/features/cv-analysis/cv-analysis.mapper";
import type { CvAnalysis } from "@/types/cv-analysis";

export const getCvAnalysis = async (
  applicationId: string,
  opts?: RequestOptions
): Promise<CvAnalysis> =>
  toCvAnalysis(await cvAnalysisRepository.get(applicationId, opts));
