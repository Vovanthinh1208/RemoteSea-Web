import { describe, expect, it } from "vitest";
import {
  buildHiringPipeline,
  getPrimaryAction,
  stageLabel,
} from "./hiring-stage.utils";
import type { Interview } from "@/types/interview";

const makeInterview = (overrides: Partial<Interview> = {}): Interview => ({
  id: "intv-1",
  durationMinutes: 30,
  proposedSlots: [],
  confirmedSlot: null,
  meetingUrl: null,
  status: "PENDING",
  createdAt: "2026-08-01T00:00:00.000Z",
  interviewerId: null,
  interviewer: null,
  ...overrides,
});

describe("stageLabel", () => {
  it("labels every status, distinguishing INTERVIEW before/after it occurs", () => {
    expect(stageLabel("PENDING", false)).toBe("Applied");
    expect(stageLabel("REVIEWING", false)).toBe("Reviewing");
    expect(stageLabel("INTERVIEW", false)).toBe("Interview");
    expect(stageLabel("INTERVIEW", true)).toBe("Awaiting decision");
    expect(stageLabel("OFFERED", false)).toBe("Hired");
    expect(stageLabel("REJECTED", false)).toBe("Rejected");
  });
});

describe("buildHiringPipeline", () => {
  it("renders no stepper progress for a rejected application", () => {
    const { steps, terminal } = buildHiringPipeline("REJECTED", null, false);
    expect(terminal).toBe("REJECTED");
    expect(steps).toEqual([]);
  });

  it("marks only 'applied' reached for a PENDING application", () => {
    const { steps } = buildHiringPipeline("PENDING", null, false);
    const byKey = Object.fromEntries(steps.map((s) => [s.key, s]));
    expect(byKey.applied?.reached).toBe(true);
    expect(byKey.reviewing?.reached).toBe(false);
    expect(byKey.applied?.current).toBe(false);
    expect(byKey.reviewing?.current).toBe(true);
  });

  it("treats 'feedback' as current once the interview has occurred but isn't decision-ready", () => {
    const interview = makeInterview({
      status: "CONFIRMED",
      confirmedSlot: "2020-01-01T00:00:00.000Z", // long past
    });
    const { steps } = buildHiringPipeline("INTERVIEW", interview, false);
    const byKey = Object.fromEntries(steps.map((s) => [s.key, s]));
    expect(byKey.feedback?.reached).toBe(true);
    expect(byKey.feedback?.current).toBe(true);
    expect(byKey.decision?.reached).toBe(false);
  });

  it("moves current to 'decision' once readyForDecision is true", () => {
    const interview = makeInterview({
      status: "CONFIRMED",
      confirmedSlot: "2020-01-01T00:00:00.000Z",
    });
    const { steps } = buildHiringPipeline("INTERVIEW", interview, true);
    const byKey = Object.fromEntries(steps.map((s) => [s.key, s]));
    expect(byKey.decision?.current).toBe(true);
  });

  it("marks decision and hired both reached once OFFERED", () => {
    const { steps } = buildHiringPipeline("OFFERED", null, false);
    const byKey = Object.fromEntries(steps.map((s) => [s.key, s]));
    expect(byKey.decision?.reached).toBe(true);
    expect(byKey.hired?.reached).toBe(true);
    expect(byKey.hired?.current).toBe(true);
  });
});

describe("getPrimaryAction", () => {
  const base = {
    interview: null,
    viewerHasSubmittedScorecard: false,
    scorecardSummary: undefined,
    eligibleReviewerCount: 3,
  };

  it("returns null (no action) for a terminal outcome", () => {
    expect(getPrimaryAction({ ...base, status: "REJECTED" })).toBeNull();
    expect(getPrimaryAction({ ...base, status: "OFFERED" })).toBeNull();
  });

  it("walks the real PENDING→REVIEWING→SHORTLISTED progression", () => {
    expect(getPrimaryAction({ ...base, status: "PENDING" })).toEqual({
      kind: "advance",
      label: "Review application",
      nextStatus: "REVIEWING",
    });
    expect(getPrimaryAction({ ...base, status: "REVIEWING" })).toEqual({
      kind: "advance",
      label: "Shortlist candidate",
      nextStatus: "SHORTLISTED",
    });
  });

  it("asks to schedule an interview when none exists yet", () => {
    expect(
      getPrimaryAction({ ...base, status: "INTERVIEW", interview: null })
    ).toEqual({ kind: "schedule-interview", label: "Schedule interview" });
  });

  it("asks to add feedback once the interview occurred and the viewer hasn't submitted", () => {
    const interview = makeInterview({
      status: "CONFIRMED",
      confirmedSlot: "2020-01-01T00:00:00.000Z",
    });
    expect(
      getPrimaryAction({ ...base, status: "INTERVIEW", interview })
    ).toEqual({ kind: "add-feedback", label: "Add your feedback" });
  });

  it("asks to view feedback status once submitted but not everyone has", () => {
    const interview = makeInterview({
      status: "CONFIRMED",
      confirmedSlot: "2020-01-01T00:00:00.000Z",
    });
    expect(
      getPrimaryAction({
        ...base,
        status: "INTERVIEW",
        interview,
        viewerHasSubmittedScorecard: true,
        scorecardSummary: { total: 1, hireCount: 1 },
      })
    ).toEqual({ kind: "view-feedback-status", label: "View feedback status" });
  });

  it("asks to make a decision once every eligible reviewer has submitted", () => {
    const interview = makeInterview({
      status: "CONFIRMED",
      confirmedSlot: "2020-01-01T00:00:00.000Z",
    });
    expect(
      getPrimaryAction({
        ...base,
        status: "INTERVIEW",
        interview,
        viewerHasSubmittedScorecard: true,
        scorecardSummary: { total: 3, hireCount: 2 },
      })
    ).toEqual({ kind: "make-decision", label: "Make hiring decision" });
  });
});
