import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { groupMessagesByDay } from "./message.utils";
import type { Message } from "@/types/message";

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg-1",
  senderId: "user-1",
  body: "Hello",
  createdAt: "2026-08-19T09:00:00.000Z",
  ...overrides,
});

describe("groupMessagesByDay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 19, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an empty list for no messages", () => {
    expect(groupMessagesByDay([])).toEqual([]);
  });

  it("groups consecutive same-day messages into one bucket, preserving order", () => {
    const morning = makeMessage({
      id: "msg-1",
      createdAt: new Date(2026, 7, 19, 9, 0).toISOString(),
    });
    const afternoon = makeMessage({
      id: "msg-2",
      createdAt: new Date(2026, 7, 19, 15, 0).toISOString(),
    });
    const nextDay = makeMessage({
      id: "msg-3",
      createdAt: new Date(2026, 7, 20, 9, 0).toISOString(),
    });

    const groups = groupMessagesByDay([morning, afternoon, nextDay]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.messages.map((m) => m.id)).toEqual(["msg-1", "msg-2"]);
    expect(groups[1]?.messages.map((m) => m.id)).toEqual(["msg-3"]);
  });

  it("labels the current local day 'Today' and the prior day 'Yesterday'", () => {
    const today = makeMessage({
      createdAt: new Date(2026, 7, 19, 8, 0).toISOString(),
    });
    const yesterday = makeMessage({
      id: "msg-2",
      createdAt: new Date(2026, 7, 18, 8, 0).toISOString(),
    });

    const groups = groupMessagesByDay([yesterday, today]);

    expect(groups[0]?.label).toBe("Yesterday");
    expect(groups[1]?.label).toBe("Today");
  });

  it("labels an older day with its weekday and date", () => {
    const older = makeMessage({
      createdAt: new Date(2026, 7, 12, 8, 0).toISOString(),
    });

    const groups = groupMessagesByDay([older]);

    expect(groups[0]?.label).toBe("Wednesday, August 12");
  });
});
