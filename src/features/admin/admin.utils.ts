import { pickColorFromString } from "@/utils/color";
import { localizedRecord } from "@/utils/labels";
import { translate } from "@/i18n/runtime";
import { formatLocalNumber } from "@/utils/format";
import type {
  AdminAuditAction,
  AdminAuditTargetType,
  AdminJob,
} from "@/types/admin";

export { LEVEL_LABELS, JOB_TYPE_LABELS } from "@/utils/labels";

export const PLAN_LABELS: Record<string, string> = localizedRecord(
  ["STANDARD", "FEATURED", "HANDS_ON"] as const,
  "admin.plan"
);

const COLORS = [
  "#16766F",
  "#0EA5E9",
  "#2563EB",
  "#7C3AED",
  "#2E9B52",
  "#EE4D2D",
  "#00B14F",
];

export const colorFor = (s: string): string => pickColorFromString(s, COLORS);

const MS_PER_HOUR = 3_600_000;
const HOURS_PER_DAY = 24;

export const hoursSince = (dateString: string): number =>
  Math.floor((Date.now() - new Date(dateString).getTime()) / MS_PER_HOUR);

// PENDING_REVIEW is only ever reached via payment (BillingRepository.
// markJobPaidAndSubmitted on the backend), so paidAt is the real
// "submitted for review" moment — createdAt is just when the DRAFT was
// first started, which can be days or weeks earlier and would otherwise
// make the queue's "waited Xh" / oldest-first ordering measure the wrong
// thing. Falls back to createdAt only defensively, for a row that somehow
// reaches here without paidAt.
export const queuedAt = (job: AdminJob): string => job.paidAt ?? job.createdAt;

export const waitFmt = (h: number): string => {
  if (h < HOURS_PER_DAY) return translate("admin.wait.hours", { h });
  const d = Math.floor(h / HOURS_PER_DAY);
  const r = h % HOURS_PER_DAY;
  return r
    ? translate("admin.wait.daysHours", { d, h: r })
    : translate("admin.wait.days", { d });
};

export const URGENT_WAIT_HOURS = 24;
const WARNING_WAIT_HOURS = 16;

export const waitCls = (h: number): string => {
  if (h >= URGENT_WAIT_HOURS) return "text-red-500";
  if (h >= WARNING_WAIT_HOURS) return "text-amber-500";
  return "text-neutral-400";
};

export type AutoState = "pass" | "fail" | "warn";
export type AutoCheck = { state: AutoState; t: string; d: string };

const MIN_DESCRIPTION_LENGTH = 100;

export const autoChecks = (job: AdminJob): AutoCheck[] => [
  {
    state: job.description.length >= MIN_DESCRIPTION_LENGTH ? "pass" : "fail",
    t: translate("admin.check.descLength"),
    d: translate("admin.check.descChars", { n: job.description.length }),
  },
  {
    state: job.salaryMin ? "pass" : "warn",
    t: translate("admin.check.salary"),
    d: translate(
      job.salaryMin ? "admin.check.salaryYes" : "admin.check.salaryNo"
    ),
  },
  {
    state: job.categories.length ? "pass" : "warn",
    t: translate("admin.check.category"),
    d: translate(
      job.categories.length
        ? "admin.check.categoryYes"
        : "admin.check.categoryNo"
    ),
  },
  {
    state: job.employer.isVerified ? "pass" : "warn",
    t: translate("admin.check.verified"),
    d: translate(
      job.employer.isVerified
        ? "admin.check.verifiedYes"
        : "admin.check.verifiedNo"
    ),
  },
];

// Items are identified by id; text lives in admin.checklist.<id>.{label,hint}
export const REVIEW_CHECKLIST = [
  {
    id: 1,
    get label() {
      return translate("admin.checklist.1.label");
    },
    get hint() {
      return translate("admin.checklist.1.hint");
    },
  },
  {
    id: 2,
    get label() {
      return translate("admin.checklist.2.label");
    },
    get hint() {
      return translate("admin.checklist.2.hint");
    },
  },
  {
    id: 3,
    get label() {
      return translate("admin.checklist.3.label");
    },
    get hint() {
      return translate("admin.checklist.3.hint");
    },
  },
  {
    id: 4,
    get label() {
      return translate("admin.checklist.4.label");
    },
    get hint() {
      return translate("admin.checklist.4.hint");
    },
  },
];

export const formatSalary = (
  min: number | null,
  max: number | null,
  currency = "USD"
): string => {
  if (!min) return translate("admin.salaryNotSpecified");
  const fmt = (n: number) => formatLocalNumber(n);
  return max
    ? `${currency} ${fmt(min)}–${fmt(max)}`
    : `${currency} ${fmt(min)}+`;
};

const CENTS_PER_DOLLAR = 100;
const DOLLARS_PER_THOUSAND = 1000;

// The admin money views deal in integer cents. These two formatters were
// written out in AdminRevenue and re-implemented inline in AdminEmployers (with
// their own copies of the cents/thousand constants) — one shared home instead.
/** Integer cents → "$1,200". */
export const formatCents = (cents: number): string =>
  `$${formatLocalNumber(cents / CENTS_PER_DOLLAR)}`;
/** Integer cents → "$1.2k", the compact form used on KPI tiles. */
export const formatCentsCompact = (cents: number): string =>
  `$${(cents / CENTS_PER_DOLLAR / DOLLARS_PER_THOUSAND).toFixed(1)}k`;

export const AUDIT_ACTION_LABEL: Record<AdminAuditAction, string> =
  localizedRecord(
    [
      "EMPLOYER_VERIFIED",
      "EMPLOYER_SUSPENDED",
      "JOB_APPROVED",
      "JOB_REJECTED",
      "JOB_REPORT_RESOLVED",
      "JOB_REPORT_DISMISSED",
      "USER_BANNED",
      "USER_UNBANNED",
      "USER_ROLE_CHANGED",
    ] as const,
    "admin.audit"
  );

// Reject/suspend/dismiss read as the "negative" branch of their pair —
// drives the row's bullet color, same amber/positive split ApplicantsPanel
// and ApplicationsTable already use for a status's connotation.
export const AUDIT_ACTION_IS_NEGATIVE: Record<AdminAuditAction, boolean> = {
  EMPLOYER_VERIFIED: false,
  EMPLOYER_SUSPENDED: true,
  JOB_APPROVED: false,
  JOB_REJECTED: true,
  JOB_REPORT_RESOLVED: false,
  JOB_REPORT_DISMISSED: true,
  USER_BANNED: true,
  USER_UNBANNED: false,
  USER_ROLE_CHANGED: false,
};

export const AUDIT_TARGET_TAB_LABEL: Record<AdminAuditTargetType, string> =
  localizedRecord(
    ["EMPLOYER", "JOB", "JOB_REPORT", "USER"] as const,
    "admin.auditTab"
  );

export type AuditDiffRow = { key: string; before: string; after: string };

/** Merges before/after JSON blobs into a readable changed-fields list — key
 * order follows `after`, falling back to `before` for a key only it has
 * (e.g. a removed field). Every value is stringified via String() so
 * booleans/numbers/null all render sensibly without per-type branching. */
export const buildAuditDiff = (
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): AuditDiffRow[] => {
  const keys = [
    ...new Set([...Object.keys(after ?? {}), ...Object.keys(before ?? {})]),
  ];
  return keys.map((key) => ({
    key,
    before: before && key in before ? String(before[key]) : "—",
    after: after && key in after ? String(after[key]) : "—",
  }));
};
