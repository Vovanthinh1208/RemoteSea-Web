import type { Application, ApplicationStatus } from "@/types/application";
import type { TalentProfile } from "@/types/talent";

export type AppStatusBucket =
  "applied" | "review" | "interview" | "offer" | "closed";

export const STATUS_TO_BUCKET: Record<ApplicationStatus, AppStatusBucket> = {
  PENDING: "applied",
  REVIEWING: "review",
  SHORTLISTED: "review",
  INTERVIEW: "interview",
  OFFERED: "offer",
  REJECTED: "closed",
  WITHDRAWN: "closed",
};

export const STAGE_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "Sent",
  REVIEWING: "Under review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interviewing",
  OFFERED: "Offer received",
  REJECTED: "Not selected",
  WITHDRAWN: "Withdrawn",
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

  if (application.status === "REJECTED" || application.status === "WITHDRAWN") {
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

export const missingProfileFields = (
  profile: TalentProfile | null | undefined
): string[] => {
  if (!profile) return ["headline", "bio", "skills"];
  const missing: string[] = [];
  if (!profile.headline) missing.push("a headline");
  if (!profile.bio) missing.push("a bio");
  if (profile.skills.length === 0) missing.push("skills");
  if (!profile.desiredSalaryMin) missing.push("your salary expectation");
  if (!profile.resumeUrl) missing.push("your CV");
  return missing;
};
