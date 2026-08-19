import type { TalentProfile, UpdateTalentProfilePayload } from "@/types/talent";

export type TalentProfileDto = TalentProfile;
export type UpdateTalentProfileRequestDto = UpdateTalentProfilePayload;

export type SubmitVerificationRequestDto = { email: string };
export type SubmitVerificationResponseDto = { message: string };
export type ConfirmVerificationRequestDto = { token: string };
export type ConfirmVerificationResponseDto = { message: string };

export type ProfileViewAnalyticsDto = {
  totalViews: number;
  uniqueViewers: number;
};
