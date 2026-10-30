import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptTeamInvitation,
  inviteTeamMember,
  listPendingInvitations,
  listTeamMembers,
  previewTeamInvitation,
  removeTeamMember,
  revokeTeamInvitation,
  updateTeamMemberRole,
} from "@/features/team/team.service";
import { useAuth } from "@/contexts/AuthContext";
import { teamKeys } from "@/core/query/query-keys";
import type { CompanyMemberRole } from "@/types/team";

export const useTeamMembers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: ({ signal }) => listTeamMembers({ signal }),
    enabled: !!user,
  });
};

/**
 * The signed-in user's role in their company, or null while loading / when
 * they aren't a member. Read from the same members list the team page uses,
 * so role-gated buttons match what the server will allow.
 */
export const useMyCompanyRole = (): CompanyMemberRole | null => {
  const { user } = useAuth();
  const { data } = useTeamMembers();
  return data?.find((m) => m.userId === user?.id)?.role ?? null;
};

export const usePendingInvitations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: teamKeys.invitations(),
    queryFn: ({ signal }) => listPendingInvitations({ signal }),
    enabled: !!user,
  });
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations() });
    },
  });
};

export const useRevokeTeamInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeTeamInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations() });
    },
  });
};

export const useUpdateTeamMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      role,
      password,
    }: {
      id: string;
      role: string;
      password?: string;
    }) => updateTeamMemberRole(id, role, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() });
    },
  });
};

export const useInvitationPreview = (token: string | undefined) =>
  useQuery({
    queryKey: teamKeys.preview(token ?? ""),
    queryFn: ({ signal }) => previewTeamInvitation(token as string, { signal }),
    enabled: !!token,
    retry: false,
  });

export const useAcceptTeamInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptTeamInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() });
    },
  });
};
