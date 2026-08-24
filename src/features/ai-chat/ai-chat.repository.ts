import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  ConversationDetailDto,
  ConversationSummaryDto,
  SendChatMessageRequestDto,
  SendChatMessageResponseDto,
} from "@/features/ai-chat/ai-chat.dto";

// remotesea-ai runs CPU-only inference on the current dev deployment — a
// single answer can take minutes (see that repo's README), so this needs a
// timeout well past axios's global 15s default (http-client.ts), not just
// a slightly larger one.
const SEND_MESSAGE_TIMEOUT_MS = 240_000;

export const aiChatRepository = {
  listConversations: async (
    opts?: RequestOptions
  ): Promise<ConversationSummaryDto[]> => {
    const { data } = await apiClient.get<ConversationSummaryDto[]>(
      "/ai-orchestrator/chat",
      { signal: opts?.signal }
    );
    return data;
  },

  getConversation: async (
    conversationId: string,
    opts?: RequestOptions
  ): Promise<ConversationDetailDto> => {
    const { data } = await apiClient.get<ConversationDetailDto>(
      `/ai-orchestrator/chat/${conversationId}`,
      { signal: opts?.signal }
    );
    return data;
  },

  sendMessage: async (
    body: SendChatMessageRequestDto
  ): Promise<SendChatMessageResponseDto> => {
    const { data } = await apiClient.post<SendChatMessageResponseDto>(
      "/ai-orchestrator/chat",
      body,
      { timeout: SEND_MESSAGE_TIMEOUT_MS }
    );
    return data;
  },
};
