import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyToJob,
  getMyApplicationStats,
  listMyApplications,
} from "@/features/applications/applications.service";
import { useAuth } from "@/contexts/AuthContext";
import { applicationKeys } from "@/core/query/query-keys";

// Prefix key — invalidating this covers every mine(page,limit) variant plus stats().
export const MY_APPLICATIONS_KEY = applicationKeys.all;

const DEFAULT_APPLICATIONS_LIMIT = 20;

export const useMyApplications = (page = 1, limit = DEFAULT_APPLICATIONS_LIMIT) => {
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

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
};
