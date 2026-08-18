import type { Message } from "@/types/message";

export type MessageDto = Message;

export type SendMessageRequestDto = { body: string };

export type ThreadResponseDto = {
  messages: MessageDto[];
  jobTitle: string;
  employerName: string;
  talentName: string | null;
};
