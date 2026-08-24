import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConversation,
  listConversations,
  sendChatMessage,
} from "@/features/ai-chat/ai-chat.service";
import { aiChatKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import { useAuth } from "@/contexts/AuthContext";

export const useConversations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: aiChatKeys.conversations(),
    queryFn: ({ signal }) => listConversations({ signal }),
    enabled: !!user,
    ...TIER.list,
  });
};

export const useConversation = (conversationId: string | null) =>
  useQuery({
    queryKey: aiChatKeys.conversation(conversationId ?? ""),
    queryFn: ({ signal }) => getConversation(conversationId!, { signal }),
    enabled: !!conversationId,
    ...TIER.live,
  });

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      question,
      applicationId,
      conversationId,
    }: {
      question: string;
      applicationId?: string;
      conversationId?: string;
    }) => sendChatMessage(question, applicationId, conversationId),

    onSuccess: (result) => {
      // The answer can take minutes (CPU-only inference) — a plain
      // invalidate rather than an optimistic merge, since there's nothing
      // meaningful to optimistically show for "the AI's answer" itself
      // (unlike a human message, there's no client-known content to render
      // early; the composer's own pending-state covers the wait instead).
      void queryClient.invalidateQueries({
        queryKey: aiChatKeys.conversation(result.conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: aiChatKeys.conversations(),
      });
    },
  });
};
