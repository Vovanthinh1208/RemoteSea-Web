import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkExperience,
  deleteWorkExperience,
  listWorkExperience,
  updateWorkExperience,
} from "@/features/talent/work-experience.service";
import { useAuth } from "@/contexts/AuthContext";
import { workExperienceKeys } from "@/core/query/query-keys";
import type { UpdateWorkExperiencePayload } from "@/types/work-experience";

export const useWorkExperience = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: workExperienceKeys.mine(),
    queryFn: ({ signal }) => listWorkExperience({ signal }),
    enabled: !!user,
  });
};

export const useCreateWorkExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workExperienceKeys.mine(),
      });
    },
  });
};

export const useUpdateWorkExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWorkExperiencePayload;
    }) => updateWorkExperience(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workExperienceKeys.mine(),
      });
    },
  });
};

export const useDeleteWorkExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workExperienceKeys.mine(),
      });
    },
  });
};
