import type { RequestOptions } from "@/core/http/request-config";
import { invitationsRepository } from "@/features/invitations/invitations.repository";
import {
  toInvitation,
  toInvitations,
} from "@/features/invitations/invitations.mapper";
import type {
  Invitation,
  RespondInvitationAction,
  SendInvitationPayload,
} from "@/types/invitation";

export const sendInvitation = async (
  payload: SendInvitationPayload
): Promise<Invitation> =>
  toInvitation(await invitationsRepository.send(payload));

export const listMyInvitations = async (
  opts?: RequestOptions
): Promise<Invitation[]> =>
  toInvitations(await invitationsRepository.listMine(opts));

export const respondToInvitation = async (
  id: string,
  action: RespondInvitationAction
): Promise<{ status: "ACCEPTED" | "DECLINED" }> =>
  invitationsRepository.respond(id, { action });
