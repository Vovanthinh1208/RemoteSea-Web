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
