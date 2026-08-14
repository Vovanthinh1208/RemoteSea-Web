import type { InvitationDto } from "@/features/invitations/invitations.dto";
import type { Invitation } from "@/types/invitation";

export const toInvitation = (dto: InvitationDto): Invitation => dto;
export const toInvitations = (dtos: InvitationDto[]): Invitation[] =>
  dtos.map(toInvitation);
