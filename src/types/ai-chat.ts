export type ChatTurn = {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  sources: string[];
  applicationId: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationDetail = Conversation & {
  turns: ChatTurn[];
};
