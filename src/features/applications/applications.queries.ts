import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyToJob,
  getApplication,
  getMyApplicationStats,
  listMyApplicationIds,
  listMyApplications,
  respondToOffer,
  withdrawApplication,
} from "@/features/applications/applications.service";
import { TIER } from "@/core/query/query-client";
import { useAuth } from "@/contexts/AuthContext";
import { applicationKeys, jobKeys } from "@/core/query/query-keys";

// Prefix key — invalidating this covers every mine(page,limit) variant plus stats().
export const MY_APPLICATIONS_KEY = applicationKeys.all;

const DEFAULT_APPLICATIONS_LIMIT = 20;

export const useMyApplications = (
  page = 1,
  limit = DEFAULT_APPLICATIONS_LIMIT
) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: applicationKeys.mine(page, limit),
    queryFn: ({ signal }) => listMyApplications(page, limit, { signal }),
    enabled: !!user,
  });
};

// DB-computed total + per-status breakdown — see TalentDashboard's KPI tiles,
// which need an accurate count even beyond whatever page size useMyApplications
// is fetched at.
export const useMyApplicationStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: applicationKeys.stats(),
    queryFn: ({ signal }) => getMyApplicationStats({ signal }),
    enabled: !!user,
  });
};

// Membership set for "already applied?" checks — lets ApplyButton derive its
// state from the server instead of a local flag that reset on every revisit.
export const useMyApplicationIds = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: applicationKeys.ids(),
    queryFn: ({ signal }) => listMyApplicationIds({ signal }),
    enabled: !!user,
    ...TIER.live,
  });
};

// Backs ApplicationDetailPage — the target of an APPLICATION_STATUS_CHANGED
// notification/activity-feed link. TIER.live: same "user expects to see
// their own recent action reflected" reasoning as useMyApplicationIds.
export const useApplication = (id: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: ({ signal }) => getApplication(id, { signal }),
    enabled: !!user && !!id,
    ...TIER.live,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyToJob,
    onSuccess: (_data, { jobId }) => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.all,
      });
      // The backend increments job.applyCount on apply, and ApplyCard renders
      // it ("Applicants so far") on the very page the user just applied from —
      // refresh the cached detail so the count isn't stale in front of them.
      queryClient.invalidateQueries({
        queryKey: jobKeys.detail(jobId),
      });
    },
  });
};

// Talent self-withdraw — invalidates the same broad `all` prefix apply()
// does, since a withdrawal changes both this application's own detail and
// the dashboard's stats/list tiles.
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawApplication,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.setQueryData(applicationKeys.detail(updated.id), updated);
    },
  });
};

export const useRespondToOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      response,
    }: {
      id: string;
      response: "ACCEPTED" | "DECLINED";
    }) => respondToOffer(id, response),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.setQueryData(applicationKeys.detail(updated.id), updated);
    },
  });
};
