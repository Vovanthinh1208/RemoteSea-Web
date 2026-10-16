import { translate } from "@/i18n/runtime";
import type { ExperienceLevel, JobType } from "@/types/job";

// Label maps resolve through the active locale at access time (getters), so
// `LEVEL_LABELS[level]` keeps working at every existing call site while
// following the language switcher. Consumers must be rendered by a component
// that subscribes to the locale (useTranslation) so it re-renders on change.
export const localizedRecord = <K extends string>(
  keys: readonly K[],
  prefix: string
): Record<K, string> => {
  const out = {} as Record<K, string>;
  for (const key of keys) {
    Object.defineProperty(out, key, {
      enumerable: true,
      get: () => translate(`${prefix}.${key}`),
    });
  }
  return out;
};

export const LEVEL_LABELS = localizedRecord<ExperienceLevel>(
  ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"],
  "common.labels.level"
);

export const JOB_TYPE_LABELS = localizedRecord<JobType>(
  ["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE"],
  "common.labels.jobType"
);
