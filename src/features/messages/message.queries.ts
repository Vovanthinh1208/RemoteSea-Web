import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getThread,
  sendMessage,
  type Thread,
} from "@/features/messages/message.service";
import type { Message } from "@/types/message";
import { useAuth } from "@/contexts/AuthContext";
import { messageKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

// An actively-open thread, not a background badge — tighter than the
// notification badge's 30s poll (see notification.queries.ts), still the
// only option given no websockets/SSE in this codebase.
const THREAD_POLL_MS = 8_000;

export const useMessages = (applicationId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: messageKeys.thread(applicationId),
    queryFn: ({ signal }) => getThread(applicationId, user!.role, { signal }),
    enabled: !!user,
    ...TIER.live,
    refetchInterval: THREAD_POLL_MS,
  });
};

export const useSendMessage = (applicationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => sendMessage(applicationId, user!.role, body),

    onMutate: async (body: string) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.thread(applicationId),
      });
      const previous = queryClient.getQueryData<Thread>(
        messageKeys.thread(applicationId)
      );

      const optimisticId = `optimistic-${crypto.randomUUID()}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        senderId: user!.id,
        body,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Thread>(
        messageKeys.thread(applicationId),
        (old) =>
          old && {
            ...old,
            messages: [...old.messages, optimisticMessage],
          }
      );

      return { previous, optimisticId };
    },

    onSuccess: (message, _body, context) => {
      queryClient.setQueryData<Thread>(
        messageKeys.thread(applicationId),
        (old) => {
          if (!old) return old;
          // The 8s background poll (see useMessages) can land between
          // onMutate and here and overwrite `old` with a fresh server
          // snapshot that either already has the real message (a fast poll)
          // or has neither the optimistic nor the real one (a poll that
          // clobbered the optimistic entry before this ran). A plain
          // "replace by optimisticId" would silently drop the message in
          // the second case — this handles both by falling back to append,
          // and skips entirely if the real message is already present.
          if (old.messages.some((m) => m.id === message.id)) {
            return {
              ...old,
              messages: old.messages.filter(
                (m) => m.id !== context?.optimisticId
              ),
            };
          }
          const hasOptimistic = old.messages.some(
            (m) => m.id === context?.optimisticId
          );
          return {
            ...old,
            messages: hasOptimistic
              ? old.messages.map((m) =>
                  m.id === context?.optimisticId ? message : m
                )
              : [...old.messages, message],
          };
        }
      );
    },

    onError: (_err, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          messageKeys.thread(applicationId),
          context.previous
        );
      }
    },
  });
};
