import type { RequestOptions } from "@/core/http/request-config";
import { teamRepository } from "@/features/team/team.repository";
import type { InviteMemberPayload } from "@/types/team";

export const listTeamMembers = (opts?: RequestOptions) =>
  teamRepository.listMembers(opts);

export const listPendingInvitations = (opts?: RequestOptions) =>
  teamRepository.listInvitations(opts);

export const inviteTeamMember = (payload: InviteMemberPayload) =>
  teamRepository.invite(payload);

export const revokeTeamInvitation = (id: string) =>
  teamRepository.revokeInvitation(id);

export const previewTeamInvitation = (token: string, opts?: RequestOptions) =>
  teamRepository.previewInvitation(token, opts);

export const acceptTeamInvitation = (token: string) =>
  teamRepository.acceptInvitation(token);

export const updateTeamMemberRole = (id: string, role: string) =>
  teamRepository.updateMemberRole(id, role);

export const removeTeamMember = (id: string) => teamRepository.removeMember(id);
