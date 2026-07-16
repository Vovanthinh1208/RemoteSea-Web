import { timeAgoShort } from "@/utils/time";

export { LEVEL_LABELS, JOB_TYPE_LABELS } from "@/utils/labels";
// Moved to src/utils (used by talent, post-job, and the home page too) —
// re-exported here so existing jobs-feature imports keep working.
export { countryFlag } from "@/utils/color";

export const isAsyncTimezone = (timezone: string | null): boolean =>
  timezone?.toLowerCase().includes("async") ?? false;

export const MS_PER_DAY = 86_400_000;

export const timeAgo = timeAgoShort;
