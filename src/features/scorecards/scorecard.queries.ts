import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createScorecard,
  getScorecards,
} from "@/features/scorecards/scorecard.service";
import { useAuth } from "@/contexts/AuthContext";
import { scorecardKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type { CreateScorecardPayload } from "@/types/scorecard";

export const useScorecards = (applicationId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: scorecardKeys.list(applicationId),
    queryFn: ({ signal }) => getScorecards(applicationId, { signal }),
    enabled: !!user && !!applicationId,
    ...TIER.live,
  });
};

export const useCreateScorecard = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateScorecardPayload) =>
      createScorecard(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scorecardKeys.list(applicationId),
      });
    },
  });
};
