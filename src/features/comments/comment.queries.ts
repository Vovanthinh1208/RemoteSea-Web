import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  getComments,
} from "@/features/comments/comment.service";
import { useAuth } from "@/contexts/AuthContext";
import { commentKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type { CreateApplicationCommentPayload } from "@/types/comment";

export const useComments = (applicationId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: commentKeys.list(applicationId),
    queryFn: ({ signal }) => getComments(applicationId, { signal }),
    enabled: !!user && !!applicationId,
    ...TIER.live,
  });
};

export const useCreateComment = (applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApplicationCommentPayload) =>
      createComment(applicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(applicationId),
      });
    },
  });
};
