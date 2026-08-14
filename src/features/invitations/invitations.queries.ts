import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listMyInvitations,
  respondToInvitation,
  sendInvitation,
} from "@/features/invitations/invitations.service";
import { useAuth } from "@/contexts/AuthContext";
import { applicationKeys, invitationKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type { RespondInvitationAction } from "@/types/invitation";

export const useMyInvitations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: invitationKeys.mine(),
    queryFn: ({ signal }) => listMyInvitations({ signal }),
    enabled: !!user,
    ...TIER.live,
  });
};

export const useSendInvitation = () =>
  useMutation({ mutationFn: sendInvitation });

export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: RespondInvitationAction;
    }) => respondToInvitation(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.mine() });
      // Accepting creates a real Application — the talent's own applications
      // list/stats (TalentDashboard) must reflect it immediately, same
      // invalidation ApplicationsPanel's status-update mutation already does
      // for the mirror case (employer action -> talent-visible list).
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
};
