import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyToJob,
  getMyApplicationStats,
  listMyApplicationIds,
  listMyApplications,
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
