import type { CvAnalysisDto } from "@/features/cv-analysis/cv-analysis.dto";
import type { CvAnalysis } from "@/types/cv-analysis";

export const toCvAnalysis = (dto: CvAnalysisDto): CvAnalysis => dto;
