import type { Invitation, RespondInvitationAction } from "@/types/invitation";

// Wire-shape aliases — currently identical to the domain type (same rationale
// as employer.dto.ts / talent-search.dto.ts).
export type InvitationDto = Invitation;

export type SendInvitationRequestDto = {
  jobId: string;
  talentId: string;
  message?: string;
};

export type RespondInvitationRequestDto = { action: RespondInvitationAction };

export type RespondInvitationResponseDto = {
  status: "ACCEPTED" | "DECLINED";
};
