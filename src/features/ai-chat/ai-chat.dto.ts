export type ChatTurnDto = {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  sources: string[];
  applicationId: string | null;
  createdAt: string;
};

export type ConversationSummaryDto = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationDetailDto = ConversationSummaryDto & {
  turns: ChatTurnDto[];
};

export type SendChatMessageRequestDto = {
  question: string;
  applicationId?: string;
  conversationId?: string;
};

export type SendChatMessageResponseDto = {
  conversationId: string;
  answer: string;
  confidence: number;
  sources: string[];
};
