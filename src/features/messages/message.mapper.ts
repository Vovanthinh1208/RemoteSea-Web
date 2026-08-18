import type {
  MessageDto,
  ThreadResponseDto,
} from "@/features/messages/message.dto";
import type { Message } from "@/types/message";

export const toMessage = (dto: MessageDto): Message => dto;

export type Thread = {
  messages: Message[];
  jobTitle: string;
  employerName: string;
  talentName: string | null;
};

export const toThread = (dto: ThreadResponseDto): Thread => ({
  messages: dto.messages.map(toMessage),
  jobTitle: dto.jobTitle,
  employerName: dto.employerName,
  talentName: dto.talentName,
});
