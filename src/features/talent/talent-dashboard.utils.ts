import type { Application, ApplicationStatus } from "@/types/application";
import type { TalentProfile } from "@/types/talent";
import type { BadgeVariant } from "@/components/ui/badge";
import { localizedRecord } from "@/utils/labels";
import { translate } from "@/i18n/runtime";

export type AppStatusBucket =
  "applied" | "review" | "interview" | "offer" | "closed";

export const STATUS_TO_BUCKET: Record<ApplicationStatus, AppStatusBucket> = {
  PENDING: "applied",
  REVIEWING: "review",
  SHORTLISTED: "review",
  INTERVIEW: "interview",
  OFFERED: "offer",
  OFFER_ACCEPTED: "offer",
  OFFER_DECLINED: "closed",
  REJECTED: "closed",
  WITHDRAWN: "closed",
};

export const STAGE_LABEL: Record<ApplicationStatus, string> = localizedRecord(
  [
    "PENDING",
    "REVIEWING",
    "SHORTLISTED",
    "INTERVIEW",
    "OFFERED",
    "OFFER_ACCEPTED",
    "OFFER_DECLINED",
    "REJECTED",
    "WITHDRAWN",
  ] as const,
  "talent.stage"
);

// Same bucket->badge mapping ApplicationsTable's rows use — pulled out here so
// ApplicationDetailPage (a different entry point onto the same data) shows an
// identical status pill instead of a second, drift-prone copy of the mapping.
const bucketBadge = (
  bucket: AppStatusBucket,
  variant: BadgeVariant
): { label: string; variant: BadgeVariant } => ({
  // Getter: resolved against the active locale on every read
  get label() {
    return translate(`talent.bucket.${bucket}`);
  },
  variant,
});

export const STATUS_BADGE: Record<
  AppStatusBucket,
  { label: string; variant: BadgeVariant }
> = {
  applied: bucketBadge("applied", "info"),
  review: bucketBadge("review", "warning"),
  interview: bucketBadge("interview", "positive"),
  offer: bucketBadge("offer", "success"),
  closed: bucketBadge("closed", "muted"),
};

export type TimelineStep = {
  status: ApplicationStatus;
  label: string;
  timestamp: string | null;
  reached: boolean;
};

// The "normal" progression track, in order — REJECTED/WITHDRAWN are terminal
// exits from any point on this track, not steps within it, so they're
// appended separately rather than listed here.
const MAIN_TRACK: ApplicationStatus[] = [
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
];

/**
 * Application Transparency's timeline — Applied/Viewed aren't
 * ApplicationStatus values (Applied is appliedAt, Viewed is the separate
 * viewedAt column), so ApplicationTimeline renders those two directly from
 * the Application itself and only asks this for the status-driven steps
 * that follow. Pure so it's testable without a component.
 */
export const buildTimelineSteps = (
  application: Application
): TimelineStep[] => {
  const eventAt = new Map(
    application.statusEvents.map((e) => [e.status, e.createdAt])
  );

  const steps: TimelineStep[] = MAIN_TRACK.map((status) => ({
    status,
    label: STAGE_LABEL[status],
    timestamp: eventAt.get(status) ?? null,
    reached: eventAt.has(status),
  }));

  const terminalStatuses: ApplicationStatus[] = [
    "OFFER_ACCEPTED",
    "OFFER_DECLINED",
    "REJECTED",
    "WITHDRAWN",
  ];
  if (terminalStatuses.includes(application.status)) {
    steps.push({
      status: application.status,
      label: STAGE_LABEL[application.status],
      timestamp: eventAt.get(application.status) ?? null,
      reached: true,
    });
  }

  return steps;
};

const trackedFields = (profile: TalentProfile): boolean[] => [
  !!profile.headline,
  !!profile.bio,
  !!profile.location,
  !!profile.timezone,
  profile.skills.length > 0,
  !!profile.resumeUrl,
  !!profile.desiredSalaryMin && !!profile.desiredSalaryMax,
  profile.yearsExperience !== null,
];

export const profileCompletion = (
  profile: TalentProfile | null | undefined
): number => {
  if (!profile) return 0;
  const fields = trackedFields(profile);
  const done = fields.filter(Boolean).length;
  return Math.round((done / fields.length) * 100);
};

// Stable codes — the dashboard maps them to localized labels (talent.missing.<code>)
export type MissingProfileField =
  "headline" | "bio" | "skills" | "salary" | "cv";

export const missingProfileFields = (
  profile: TalentProfile | null | undefined
): MissingProfileField[] => {
  if (!profile) return ["headline", "bio", "skills"];
  const missing: MissingProfileField[] = [];
  if (!profile.headline) missing.push("headline");
  if (!profile.bio) missing.push("bio");
  if (profile.skills.length === 0) missing.push("skills");
  if (!profile.desiredSalaryMin) missing.push("salary");
  if (!profile.resumeUrl) missing.push("cv");
  return missing;
};
