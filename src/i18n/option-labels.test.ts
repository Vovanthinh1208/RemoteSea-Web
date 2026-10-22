import { describe, expect, it } from "vitest";
import { resolveTranslation } from "@/i18n/translate";
import { valueSlug } from "@/i18n/labels";
import * as talent from "@/features/talent/talent.constants";
import * as postJob from "@/features/post-job/post-job.schemas";
import { COUNTRY_OPTIONS } from "@/features/employer/talent-search/talent-search.filters";

// optionLabel() falls back to the raw (English) value when a label is missing,
// which keeps unknown backend values readable but would silently leave English
// in the Vietnamese UI for our own option lists. Every value we ship must have
// a label in both locales, and the vi label must really be Vietnamese.
const OPTION_LISTS: [prefix: string, values: readonly string[]][] = [
  ["talent.opt.years", talent.YEARS_BUCKETS],
  ["talent.opt.seniority", talent.SENIORITY_OPTIONS],
  ["talent.opt.role", talent.PRIMARY_ROLE_OPTIONS],
  ["talent.opt.rtw", talent.RIGHT_TO_WORK_OPTIONS],
  ["talent.opt.notice", talent.NOTICE_PERIOD_OPTIONS],
  ["talent.opt.tz", talent.TIMEZONE_OPTIONS],
  ["postjob.opt.size", postJob.COMPANY_SIZE_OPTIONS],
  ["postjob.opt.hq", postJob.HQ_OPTIONS],
  ["postjob.opt.seniority", postJob.SENIORITY_OPTIONS],
  ["postjob.opt.jobtype", postJob.JOB_TYPE_OPTIONS],
  ["postjob.opt.tz", postJob.TIMEZONE_OPTIONS],
  ["postjob.opt.loc", postJob.LOCATION_OPTIONS],
  ["postjob.opt.period", postJob.PERIOD_OPTIONS],
  ["postjob.opt.benefit", postJob.BENEFIT_OPTIONS],
  ["employer.country", COUNTRY_OPTIONS],
];

// Labels deliberately identical in both locales: proper nouns and the
// loanwords the product glossary keeps in Vietnamese tech hiring ("remote",
// "freelance", seniority titles).
const SAME_IN_BOTH = new Set([
  "Junior",
  "Staff",
  "Freelance",
  "Remote",
  "Singapore",
  "🇸🇬 Singapore",
  "Indonesia",
  "Philippines",
  "Malaysia",
  "UTC+9 (Tokyo · Seoul)",
  "UTC+10 (Sydney · Melbourne)",
]);

describe("option labels", () => {
  it.each(OPTION_LISTS)(
    "every %s value has an en and vi label",
    (prefix, values) => {
      const problems: string[] = [];
      for (const value of values) {
        const key = `${prefix}.${valueSlug(value)}`;
        const en = resolveTranslation("en", key);
        const vi = resolveTranslation("vi", key);
        if (en === key) problems.push(`missing en:${key} (${value})`);
        if (vi === key) problems.push(`missing vi:${key} (${value})`);
        if (
          vi !== key &&
          vi === en &&
          !SAME_IN_BOTH.has(en) &&
          /[a-z]{3,}/i.test(en)
        )
          problems.push(`vi:${key} is still English ("${en}")`);
      }
      expect(problems).toEqual([]);
    }
  );
});
