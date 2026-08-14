import type { TalentSearchResponseDto } from "@/features/employer/talent-search/talent-search.dto";
import type { TalentSearchResponse } from "@/types/talent-search";

export const toTalentSearchResponse = (
  dto: TalentSearchResponseDto
): TalentSearchResponse => dto;
