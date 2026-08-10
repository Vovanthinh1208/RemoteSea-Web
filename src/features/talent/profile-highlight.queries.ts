import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProfileHighlight,
  deleteProfileHighlight,
  listProfileHighlights,
  updateProfileHighlight,
} from "@/features/talent/profile-highlight.service";
import { useAuth } from "@/contexts/AuthContext";
import { profileHighlightKeys } from "@/core/query/query-keys";
import type { UpdateProfileHighlightPayload } from "@/types/profile-highlight";

export const useProfileHighlights = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileHighlightKeys.mine(),
    queryFn: ({ signal }) => listProfileHighlights({ signal }),
    enabled: !!user,
  });
};

export const useCreateProfileHighlight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProfileHighlight,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileHighlightKeys.mine(),
      });
    },
  });
};

export const useUpdateProfileHighlight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProfileHighlightPayload;
    }) => updateProfileHighlight(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileHighlightKeys.mine(),
      });
    },
  });
};

export const useDeleteProfileHighlight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProfileHighlight,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileHighlightKeys.mine(),
      });
    },
  });
};
