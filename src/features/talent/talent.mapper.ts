import type { TalentProfileDto } from "@/features/talent/talent.dto";
import type { TalentProfile } from "@/types/talent";

export const toTalentProfile = (
  dto: TalentProfileDto
): TalentProfile => dto;
