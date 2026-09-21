import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  getComments,
} from "@/features/comments/comment.service";
import { useAuth } from "@/contexts/AuthContext";
import { commentKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type {
  ApplicationComment,
  ApplicationCommentListResponse,
  CreateApplicationCommentPayload,
} from "@/types/comment";

export const useComments = (applicationId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: commentKeys.list(applicationId),
    queryFn: ({ signal }) => getComments(applicationId, { signal }),
    enabled: !!user && !!applicationId,
    ...TIER.live,
    // This is the one place a teammate's activity needs to show up without
    // the viewer doing anything — "multi-seat collaboration" only works if
    // switching back to this tab reliably shows what a co-worker posted
    // while it was in the background, not just whatever was cached 30s ago.
    refetchOnWindowFocus: true,
  });
};

export const useCreateComment = (applicationId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = commentKeys.list(applicationId);

  return useMutation({
    mutationFn: (payload: CreateApplicationCommentPayload) =>
      createComment(applicationId, payload),
    // Optimistic append — a discussion thread should feel like posting a
    // message, not like submitting a form and waiting for a round trip.
    // Rolled back in onError if the post actually fails (e.g. rate limit).
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<ApplicationCommentListResponse>(queryKey);

      if (user) {
        const optimistic: ApplicationComment = {
          id: `optimistic-${Date.now()}`,
          authorId: user.id,
          author: { name: user.name },
          body: payload.body,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<ApplicationCommentListResponse>(
          queryKey,
          (old) => ({ comments: [...(old?.comments ?? []), optimistic] })
        );
      }

      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    // Always reconcile with the server's copy (real id/createdAt, and picks
    // up anything a teammate posted in the meantime) rather than trusting
    // the optimistic row forever.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
