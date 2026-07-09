import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyToJob, listMyApplications } from "@/features/applications/applications.api";
import { useAuth } from "@/contexts/AuthContext";

// Hierarchical (matches the rest of the app's ["feature", "scope"] convention)
// rather than a flat string.
export const MY_APPLICATIONS_KEY = ["applications", "me"];

export const useMyApplications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: MY_APPLICATIONS_KEY,
    queryFn: listMyApplications,
    enabled: !!user,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_KEY });
    },
  });
};
