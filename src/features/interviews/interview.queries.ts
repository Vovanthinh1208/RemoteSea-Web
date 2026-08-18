import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmInterview,
  getInterview,
  proposeInterview,
} from "@/features/interviews/interview.service";
import { useAuth } from "@/contexts/AuthContext";
import { interviewKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

// No polling here (unlike useMessages' 8s interval) — an interview changes
// far less often than a chat thread; an ordinary revisit-triggered refetch
// is enough, so this deliberately doesn't add infrastructure it doesn't need.
export const useInterview = (applicationId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: interviewKeys.detail(applicationId),
    queryFn: ({ signal }) =>
      getInterview(applicationId, user!.role, { signal }),
    enabled: !!user,
    ...TIER.list,
  });
};

export const useProposeInterview = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      durationMinutes,
      proposedSlots,
      meetingUrl,
    }: {
      durationMinutes: number;
      proposedSlots: string[];
      meetingUrl: string | undefined;
    }) =>
      proposeInterview(
        applicationId,
        durationMinutes,
        proposedSlots,
        meetingUrl
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewKeys.detail(applicationId),
      });
    },
  });
};

export const useConfirmInterview = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slot: string) => confirmInterview(applicationId, slot),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewKeys.detail(applicationId),
      });
    },
  });
};
