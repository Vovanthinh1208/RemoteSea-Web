import type { RequestOptions } from "@/core/http/request-config";
import { aiChatRepository } from "@/features/ai-chat/ai-chat.repository";
import {
  toConversation,
  toConversationDetail,
} from "@/features/ai-chat/ai-chat.mapper";
import type { Conversation, ConversationDetail } from "@/types/ai-chat";

export const listConversations = async (
  opts?: RequestOptions
): Promise<Conversation[]> =>
  (await aiChatRepository.listConversations(opts)).map(toConversation);

export const getConversation = async (
  conversationId: string,
  opts?: RequestOptions
): Promise<ConversationDetail> =>
  toConversationDetail(
    await aiChatRepository.getConversation(conversationId, opts)
  );

export type SendMessageResult = {
  conversationId: string;
  answer: string;
  confidence: number;
  sources: string[];
};

export const sendChatMessage = async (
  question: string,
  applicationId?: string,
  conversationId?: string
): Promise<SendMessageResult> =>
  aiChatRepository.sendMessage({ question, applicationId, conversationId });
