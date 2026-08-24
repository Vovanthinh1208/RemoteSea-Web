import type {
  ChatTurnDto,
  ConversationDetailDto,
  ConversationSummaryDto,
} from "@/features/ai-chat/ai-chat.dto";
import type {
  ChatTurn,
  Conversation,
  ConversationDetail,
} from "@/types/ai-chat";

export const toChatTurn = (dto: ChatTurnDto): ChatTurn => dto;

export const toConversation = (dto: ConversationSummaryDto): Conversation =>
  dto;

export const toConversationDetail = (
  dto: ConversationDetailDto
): ConversationDetail => ({
  ...toConversation(dto),
  turns: dto.turns.map(toChatTurn),
});
