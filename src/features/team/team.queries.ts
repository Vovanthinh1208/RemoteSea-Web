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

export const useTeamMembers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: ({ signal }) => listTeamMembers({ signal }),
    enabled: !!user,
  });
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
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateTeamMemberRole(id, role),
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
