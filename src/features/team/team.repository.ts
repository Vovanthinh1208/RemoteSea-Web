import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  InviteMemberPayload,
  InvitationPreview,
  PendingInvitation,
  TeamMember,
} from "@/types/team";

export const teamRepository = {
  listMembers: async (opts?: RequestOptions): Promise<TeamMember[]> => {
    const { data } = await apiClient.get<TeamMember[]>("/team/members", {
      signal: opts?.signal,
    });
    return data;
  },

  listInvitations: async (
    opts?: RequestOptions
  ): Promise<PendingInvitation[]> => {
    const { data } = await apiClient.get<PendingInvitation[]>(
      "/team/invitations",
      { signal: opts?.signal }
    );
    return data;
  },

  invite: async (payload: InviteMemberPayload) => {
    const { data } = await apiClient.post("/team/invitations", payload);
    return data;
  },

  revokeInvitation: async (id: string): Promise<void> => {
    await apiClient.delete(`/team/invitations/${id}`);
  },

  previewInvitation: async (
    token: string,
    opts?: RequestOptions
  ): Promise<InvitationPreview> => {
    const { data } = await apiClient.get<InvitationPreview>(
      `/team/invitations/${token}`,
      { signal: opts?.signal }
    );
    return data;
  },

  acceptInvitation: async (token: string): Promise<TeamMember> => {
    const { data } = await apiClient.post<TeamMember>(
      "/team/invitations/accept",
      { token }
    );
    return data;
  },

  updateMemberRole: async (id: string, role: string): Promise<TeamMember> => {
    const { data } = await apiClient.patch<TeamMember>(`/team/members/${id}`, {
      role,
    });
    return data;
  },

  removeMember: async (id: string): Promise<void> => {
    await apiClient.delete(`/team/members/${id}`);
  },
};
