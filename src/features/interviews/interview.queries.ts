import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInterview,
  confirmInterview,
  getInterview,
  getInterviewIcs,
  getUpcomingInterviews,
  proposeInterview,
} from "@/features/interviews/interview.service";
import { useAuth } from "@/contexts/AuthContext";
import { activityKeys, interviewKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import { downloadBlob } from "@/utils/download-blob";

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

// Company-wide agenda — no polling (same reasoning as useInterview above),
// and TIER.list rather than TIER.live since a stale-by-a-minute schedule
// view is fine; it's not something the viewer just acted on themselves.
export const useUpcomingInterviews = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: interviewKeys.upcoming(),
    queryFn: ({ signal }) => getUpcomingInterviews({ signal }),
    enabled: !!user,
    ...TIER.list,
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
      // Confirming produces a fresh INTERVIEW_CONFIRMED entry (see the
      // backend's activity.util.ts) — this cache didn't exist when this
      // mutation was first written, so nothing invalidated it on this path
      // until now.
      queryClient.invalidateQueries({ queryKey: activityKeys.mine() });
    },
  });
};

// Fetches the .ics file and immediately saves it — there's no cached "data"
// here worth a useQuery, the whole point is the one-off browser download,
// same shape as users.queries.ts's useExportMyData.
export const useDownloadInterviewIcs = (applicationId: string) => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const blob = await getInterviewIcs(applicationId, user!.role);
      downloadBlob(blob, "interview.ics");
    },
  });
};

// Employer-only — cancels a PENDING or CONFIRMED interview.
export const useCancelInterview = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelInterview(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewKeys.detail(applicationId),
      });
      queryClient.invalidateQueries({ queryKey: interviewKeys.upcoming() });
    },
  });
};
