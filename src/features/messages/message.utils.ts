import type { Message } from "@/types/message";

const dayKeyOf = (d: Date): string =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Same "Today"/relative-day labeling as interview.utils.ts's dayLabel, just
// for past dates (Yesterday instead of Tomorrow) — a message thread's own
// equivalent of that pattern.
const dayHeading = (iso: string): string => {
  const target = new Date(iso);
  const now = new Date();
  if (dayKeyOf(target) === dayKeyOf(now)) return "Today";
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );
  if (dayKeyOf(target) === dayKeyOf(yesterday)) return "Yesterday";
  return target.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

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
        label: dayHeading(message.createdAt),
        messages: [message],
      });
    }
  }
  return groups;
};
