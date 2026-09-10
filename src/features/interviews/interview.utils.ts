import { dayKeyOf, relativeDayLabel } from "@/utils/time";
import type { UpcomingInterview } from "@/types/interview";

export const DURATION_OPTIONS = [15, 30, 45, 60, 90];
export const MAX_SLOTS = 2;

// Mirrors the backend's own eligibility rule (ScorecardsService/
// ReviewsService's isEligible: CONFIRMED and the slot has passed) — pulled
// into its own function, not inlined at the call site, so the impure
// Date.now() read doesn't happen directly inside a component's render body
// (see BACKLOG_THRESHOLD_MS.backlogDays for the same pattern elsewhere).
export const hasOccurred = (confirmedSlot: string | null): boolean =>
  !!confirmedSlot && new Date(confirmedSlot).getTime() <= Date.now();

export const formatSlot = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// <input type="datetime-local"> works in local time with no timezone info —
// this converts an ISO-UTC string (from the API) into the local
// "YYYY-MM-DDTHH:mm" shape that input expects as a pre-filled value.
export const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export interface InterviewDayGroup {
  key: string;
  label: string;
  interviews: UpcomingInterview[];
}

// Interviews already arrive sorted soonest-first (see InterviewsRepository.
// findUpcomingForCompany's orderBy on the backend) — this walks that order
// once instead of grouping-then-resorting, so consecutive same-day
// interviews land in one group without disturbing the order within or
// across days.
export const groupInterviewsByDay = (
  interviews: UpcomingInterview[]
): InterviewDayGroup[] => {
  const groups: InterviewDayGroup[] = [];
  for (const interview of interviews) {
    const key = dayKeyOf(new Date(interview.confirmedSlot));
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.interviews.push(interview);
    } else {
      groups.push({
        key,
        label: relativeDayLabel(interview.confirmedSlot, "tomorrow"),
        interviews: [interview],
      });
    }
  }
  return groups;
};
