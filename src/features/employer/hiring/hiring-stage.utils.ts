import { hasOccurred } from "@/features/interviews/interview.utils";
import type { ApplicationStatus } from "@/types/application";
import type { Interview } from "@/types/interview";
import type { ScorecardSummary } from "@/types/scorecard";

export type HiringStepKey =
  "applied" | "reviewing" | "interview" | "feedback" | "decision" | "hired";

export interface HiringStep {
  key: HiringStepKey;
  label: string;
  reached: boolean;
  current: boolean;
}

const STEP_ORDER: [HiringStepKey, string][] = [
  ["applied", "Applied"],
  ["reviewing", "Reviewing"],
  ["interview", "Interview"],
  ["feedback", "Feedback"],
  ["decision", "Decision"],
  ["hired", "Hired"],
];

const HAPPY_PATH: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "OFFER_ACCEPTED",
];

export const isTerminalNegative = (status: ApplicationStatus): boolean =>
  status === "REJECTED" || status === "WITHDRAWN";

export type StageBadgeVariant =
  "info" | "positive" | "success" | "warning" | "muted";

// REVIEWING/SHORTLISTED match talent-dashboard.utils.ts's STATUS_BADGE
// ("review" bucket -> "warning") — the same ApplicationStatus previously
// rendered amber on the talent side and green here, an unintentional color
// drift between the two independent status-badge systems (found auditing
// this file; see talent-dashboard.utils.ts's own comment on why that one
// exists as a single shared source in the first place).
export const stageBadgeVariant = (
  status: ApplicationStatus,
  interviewOccurred: boolean
): StageBadgeVariant => {
  switch (status) {
    case "PENDING":
      return "info";
    case "REVIEWING":
    case "SHORTLISTED":
      return "warning";
    case "INTERVIEW":
      return interviewOccurred ? "warning" : "positive";
    case "OFFERED":
    case "OFFER_ACCEPTED":
      return "success";
    case "OFFER_DECLINED":
    case "REJECTED":
    case "WITHDRAWN":
      return "muted";
  }
};

export const stageLabel = (
  status: ApplicationStatus,
  interviewOccurred: boolean
): string => {
  switch (status) {
    case "PENDING":
      return "Applied";
    case "REVIEWING":
      return "Reviewing";
    case "SHORTLISTED":
      return "Shortlisted";
    case "INTERVIEW":
      return interviewOccurred ? "Awaiting decision" : "Interview";
    case "OFFERED":
      return "Offer sent";
    case "OFFER_ACCEPTED":
      return "Hired";
    case "OFFER_DECLINED":
      return "Offer declined";
    case "REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
  }
};

export interface HiringPipeline {
  steps: HiringStep[];
  terminal: "REJECTED" | "WITHDRAWN" | null;
}

// `readyForDecision` (has enough scorecard feedback come in to act on) is
// supplied by the caller rather than computed here — it depends on team
// size + scorecard counts, which this pure status/interview-only util
// deliberately doesn't fetch. Without it, "feedback" is treated as the
// current step for the whole post-interview, pre-offer window.
export const buildHiringPipeline = (
  status: ApplicationStatus,
  interview: Interview | null | undefined,
  readyForDecision: boolean
): HiringPipeline => {
  if (isTerminalNegative(status)) {
    // A rejected/withdrawn application could have stopped at any earlier
    // stage — EmployerApplicant carries no status-history, so rather than
    // guess which stages it actually passed through, this renders no
    // partial happy-path progress at all (see ApplicationActivityTimeline
    // for the one place that *does* show real history, from data that's
    // actually available).
    return { steps: [], terminal: status as "REJECTED" | "WITHDRAWN" };
  }

  // OFFER_DECLINED reached exactly as far as OFFERED did (it's only
  // reachable from there) — same position in HAPPY_PATH for "how far did
  // this get" purposes, distinguished from OFFER_ACCEPTED by the `hired`
  // step and by `current` below, not by a different index.
  const progressStatus = status === "OFFER_DECLINED" ? "OFFERED" : status;
  const happyIndex = HAPPY_PATH.indexOf(progressStatus);
  const interviewIndex = HAPPY_PATH.indexOf("INTERVIEW");
  const offeredIndex = HAPPY_PATH.indexOf("OFFERED");
  const occurred = hasOccurred(interview?.confirmedSlot ?? null);
  // Once the status has moved *past* INTERVIEW (i.e. OFFERED or later), the
  // interview stage is behind the candidate by definition — feedback
  // reached shouldn't depend on whatever the (possibly stale/unloaded)
  // interview object says at that point.
  const pastInterviewStage = happyIndex > interviewIndex;

  const reached: Record<HiringStepKey, boolean> = {
    applied: true,
    reviewing: happyIndex >= HAPPY_PATH.indexOf("REVIEWING"),
    interview: happyIndex >= interviewIndex,
    feedback: happyIndex >= interviewIndex && (pastInterviewStage || occurred),
    decision: happyIndex >= offeredIndex,
    hired: status === "OFFER_ACCEPTED",
  };

  let current: HiringStepKey | null =
    STEP_ORDER.map(([key]) => key).find((key) => !reached[key]) ?? "hired";
  if (current === "decision" && !readyForDecision) current = "feedback";
  // A declined offer is resolved, not "in progress" — no step should read
  // as current (the stage badge already conveys the outcome).
  if (status === "OFFER_DECLINED") current = null;

  const steps = STEP_ORDER.map(([key, label]) => ({
    key,
    label,
    reached: reached[key],
    current: current === key,
  }));

  return { steps, terminal: null };
};

// ─── Next-action system ─────────────────────────────────────────────────

export type HiringAction =
  | { kind: "advance"; label: string; nextStatus: ApplicationStatus }
  | { kind: "schedule-interview"; label: string }
  | { kind: "view-interview"; label: string }
  | { kind: "add-feedback"; label: string }
  | { kind: "view-feedback-status"; label: string }
  | { kind: "make-decision"; label: string }
  | null;

export interface PrimaryActionContext {
  status: ApplicationStatus;
  interview: Interview | null | undefined;
  viewerHasSubmittedScorecard: boolean;
  scorecardSummary: ScorecardSummary | undefined;
  eligibleReviewerCount: number;
}

// Exactly one primary action per state — the task's whole point. Reuses the
// real PENDING→REVIEWING→SHORTLISTED→INTERVIEW→OFFERED progression
// (employer-dashboard.utils.ts's NEXT_STAGE) rather than the simpler
// 4-state table the design brief sketches, since that's the actual
// business logic already live in ApplicantsPanel and must keep working.
export const getPrimaryAction = (ctx: PrimaryActionContext): HiringAction => {
  const {
    status,
    interview,
    viewerHasSubmittedScorecard,
    scorecardSummary,
    eligibleReviewerCount,
  } = ctx;

  if (
    status === "REJECTED" ||
    status === "WITHDRAWN" ||
    status === "OFFERED" ||
    status === "OFFER_ACCEPTED" ||
    status === "OFFER_DECLINED"
  ) {
    return null; // outcome is already visible in the stage badge — no action to take
  }
  if (status === "PENDING") {
    return {
      kind: "advance",
      label: "Review application",
      nextStatus: "REVIEWING",
    };
  }
  if (status === "REVIEWING") {
    return {
      kind: "advance",
      label: "Shortlist candidate",
      nextStatus: "SHORTLISTED",
    };
  }
  if (status === "SHORTLISTED") {
    return {
      kind: "advance",
      label: "Move to interview",
      nextStatus: "INTERVIEW",
    };
  }

  // status === "INTERVIEW"
  if (!interview) {
    return { kind: "schedule-interview", label: "Schedule interview" };
  }
  if (!hasOccurred(interview.confirmedSlot)) {
    return { kind: "view-interview", label: "View interview" };
  }
  if (!viewerHasSubmittedScorecard) {
    return { kind: "add-feedback", label: "Add your feedback" };
  }
  const submitted = scorecardSummary?.total ?? 0;
  if (submitted < eligibleReviewerCount) {
    return { kind: "view-feedback-status", label: "View feedback status" };
  }
  return { kind: "make-decision", label: "Make hiring decision" };
};
