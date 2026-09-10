import { dayKeyOf, relativeDayLabel } from "@/utils/time";
import type { Message } from "@/types/message";

export interface MessageDayGroup {
  key: string;
  label: string;
  messages: Message[];
}

// Messages already arrive sorted oldest-first (see message.service.ts) —
// this walks that order once, grouping consecutive same-day messages
// together, rather than re-sorting.
export const groupMessagesByDay = (messages: Message[]): MessageDayGroup[] => {
  const groups: MessageDayGroup[] = [];
  for (const message of messages) {
    const key = dayKeyOf(new Date(message.createdAt));
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.messages.push(message);
    } else {
      groups.push({
        key,
        label: relativeDayLabel(message.createdAt, "yesterday"),
        messages: [message],
      });
    }
  }
  return groups;
};
