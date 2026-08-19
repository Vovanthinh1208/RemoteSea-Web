import { useQuery } from "@tanstack/react-query";
import { listActivity } from "@/features/talent/activity.service";
import { useAuth } from "@/contexts/AuthContext";
import { activityKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

export const useTalentActivity = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: activityKeys.mine(),
    queryFn: ({ signal }) => listActivity({ signal }),
    enabled: !!user,
    ...TIER.live,
  });
};
