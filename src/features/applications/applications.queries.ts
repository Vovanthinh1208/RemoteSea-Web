import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyToJob, listMyApplications } from "@/features/applications/applications.service";
import { useAuth } from "@/contexts/AuthContext";
import { applicationKeys } from "@/core/query/query-keys";

// Hierarchical (matches the rest of the app's ["feature", "scope"] convention)
// rather than a flat string.
export const MY_APPLICATIONS_KEY = applicationKeys.mine();

export const useMyApplications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: applicationKeys.mine(),
    queryFn: ({ signal }) => listMyApplications({ signal }),
    enabled: !!user,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine() });
    },
  });
};
