import { getIntlLocale, translate } from "@/i18n/runtime";

const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

type RelativeTimeKeys = {
  day: string;
  hour: string;
  now: string;
};

const formatRelativeTime = (
  dateString: string | null,
  keys: RelativeTimeKeys
): string => {
  if (!dateString) return translate(keys.now);
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / MS_PER_DAY);
  if (days >= 1) return translate(keys.day, { n: days });
  const hours = Math.floor(diff / MS_PER_HOUR);
  if (hours >= 1) return translate(keys.hour, { n: hours });
  return translate(keys.now);
};

// The two conventions used across the app: callers that append their own
// "ago" in surrounding copy (t("common.time.ago", { time: timeAgoShort(x) }))
// vs. callers that render the result standalone. Strings come from the
// "common.time" namespace so they follow the active locale.
export const timeAgoShort = (dateString: string | null): string =>
  formatRelativeTime(dateString, {
    day: "common.time.dayShort",
    hour: "common.time.hourShort",
    now: "common.time.justNowLower",
  });

export const timeAgoLong = (dateString: string | null): string =>
  formatRelativeTime(dateString, {
    day: "common.time.dayAgo",
    hour: "common.time.hourAgo",
    now: "common.time.justNow",
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
  if (dayKeyOf(target) === dayKeyOf(now)) return translate("common.time.today");
  const offset = adjacent === "yesterday" ? -1 : 1;
  const adjacentDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + offset
  );
  if (dayKeyOf(target) === dayKeyOf(adjacentDay)) {
    return translate(
      adjacent === "yesterday"
        ? "common.time.yesterday"
        : "common.time.tomorrow"
    );
  }
  return target.toLocaleDateString(getIntlLocale(), {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};
