const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

export interface RelativeTimeSuffix {
  day: string;
  hour: string;
  now: string;
}

const formatRelativeTime = (
  dateString: string | null,
  suffix: RelativeTimeSuffix
): string => {
  if (!dateString) return suffix.now;
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / MS_PER_DAY);
  if (days >= 1) return `${days}${suffix.day}`;
  const hours = Math.floor(diff / MS_PER_HOUR);
  if (hours >= 1) return `${hours}${suffix.hour}`;
  return suffix.now;
};

// The two suffix conventions used across the app: callers that append their own
// "ago" in surrounding copy ("{timeAgoShort(x)} ago") vs. callers that render the
// result standalone. Previously each feature defined its own near-identical wrapper.
export const timeAgoShort = (dateString: string | null): string =>
  formatRelativeTime(dateString, {
    day: "d",
    hour: "h",
    now: "just now",
  });

export const timeAgoLong = (dateString: string | null): string =>
  formatRelativeTime(dateString, {
    day: "d ago",
    hour: "h ago",
    now: "Just now",
  });

// Local calendar-day identity (not UTC, not a timestamp) — two Dates on the
// same local day produce the same key regardless of their time-of-day, which
// is exactly what a "group by day" walker needs. Was defined byte-for-byte
// identically in message.utils.ts, notification.utils.ts, and
// interview.utils.ts (each with a comment pointing at one of the others) —
// moved here per this project's own "if two features need the same util, it
// moves to src/utils" rule (see docs/ARCHITECTURE.md).
export const dayKeyOf = (d: Date): string =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// The "Today" / one-adjacent-day / weekday-long fallback pattern shared by
// every day-grouped feed in the app. `adjacent` picks which single relative
// day besides Today gets a special-cased label — "yesterday" for feeds read
// backward in time (messages, notifications), "tomorrow" for feeds read
// forward (upcoming interviews). Only one of the two is ever meaningful for
// a given feed, so this takes it as a parameter rather than checking both.
export const relativeDayLabel = (
  iso: string,
  adjacent: "yesterday" | "tomorrow"
): string => {
  const target = new Date(iso);
  const now = new Date();
  if (dayKeyOf(target) === dayKeyOf(now)) return "Today";
  const offset = adjacent === "yesterday" ? -1 : 1;
  const adjacentDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + offset
  );
  if (dayKeyOf(target) === dayKeyOf(adjacentDay)) {
    return adjacent === "yesterday" ? "Yesterday" : "Tomorrow";
  }
  return target.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};
