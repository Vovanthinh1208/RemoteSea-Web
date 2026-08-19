import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatTime, groupInterviewsByDay } from "./interview.utils";
import type { UpcomingInterview } from "@/types/interview";

const makeInterview = (
  overrides: Partial<UpcomingInterview> = {}
): UpcomingInterview => ({
  id: "intv-1",
  applicationId: "app-1",
  confirmedSlot: "2026-08-19T09:00:00.000Z",
  durationMinutes: 30,
  meetingUrl: null,
  talentName: "Jane Doe",
  jobTitle: "Backend Engineer",
  interviewerId: null,
  interviewerName: null,
  ...overrides,
});

describe("formatTime", () => {
  it("formats an ISO timestamp as a local time string", () => {
    expect(formatTime("2026-08-19T09:00:00.000Z")).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("groupInterviewsByDay", () => {
  beforeEach(() => {
    // Local noon, so "Today"/"Tomorrow" comparisons don't flip based on the
    // test runner's own timezone offset landing near midnight.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 19, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an empty list for no interviews", () => {
    expect(groupInterviewsByDay([])).toEqual([]);
  });

  it("groups consecutive same-day interviews into one bucket, preserving order", () => {
    const morning = makeInterview({
      id: "intv-1",
      confirmedSlot: new Date(2026, 7, 19, 9, 0).toISOString(),
    });
    const afternoon = makeInterview({
      id: "intv-2",
      confirmedSlot: new Date(2026, 7, 19, 15, 0).toISOString(),
    });
    const nextDay = makeInterview({
      id: "intv-3",
      confirmedSlot: new Date(2026, 7, 20, 9, 0).toISOString(),
    });

    const groups = groupInterviewsByDay([morning, afternoon, nextDay]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.interviews.map((i) => i.id)).toEqual([
      "intv-1",
      "intv-2",
    ]);
    expect(groups[1]?.interviews.map((i) => i.id)).toEqual(["intv-3"]);
  });

  it("labels the current local day as 'Today' and the next as 'Tomorrow'", () => {
    const today = makeInterview({
      confirmedSlot: new Date(2026, 7, 19, 14, 0).toISOString(),
    });
    const tomorrow = makeInterview({
      id: "intv-2",
      confirmedSlot: new Date(2026, 7, 20, 9, 0).toISOString(),
    });

    const groups = groupInterviewsByDay([today, tomorrow]);

    expect(groups[0]?.label).toBe("Today");
    expect(groups[1]?.label).toBe("Tomorrow");
  });

  it("labels a further-out day with its weekday and date", () => {
    const nextWeek = makeInterview({
      confirmedSlot: new Date(2026, 7, 26, 9, 0).toISOString(),
    });

    const groups = groupInterviewsByDay([nextWeek]);

    expect(groups[0]?.label).toBe("Wednesday, August 26");
  });
});
