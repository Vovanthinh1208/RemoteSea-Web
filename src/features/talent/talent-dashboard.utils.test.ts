import { describe, expect, it } from "vitest";
import { buildTimelineSteps } from "./talent-dashboard.utils";
import type { Application } from "@/types/application";

const baseApplication: Application = {
  id: "app-1",
  jobId: "job-1",
  talentId: "talent-1",
  coverLetter: null,
  resumeUrl: null,
  status: "PENDING",
  appliedAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  viewedAt: null,
  statusEvents: [{ status: "PENDING", createdAt: "2026-08-01T00:00:00.000Z" }],
};

describe("buildTimelineSteps", () => {
  it("marks every main-track step unreached when the application is still PENDING", () => {
    const steps = buildTimelineSteps(baseApplication);
    expect(steps.every((s) => !s.reached)).toBe(true);
    expect(steps.map((s) => s.status)).toEqual([
      "REVIEWING",
      "SHORTLISTED",
      "INTERVIEW",
      "OFFERED",
    ]);
  });

  it("reaches only the steps that have a status event, with their real timestamps", () => {
    const application: Application = {
      ...baseApplication,
      status: "SHORTLISTED",
      statusEvents: [
        { status: "PENDING", createdAt: "2026-08-01T00:00:00.000Z" },
        { status: "REVIEWING", createdAt: "2026-08-02T00:00:00.000Z" },
        { status: "SHORTLISTED", createdAt: "2026-08-04T00:00:00.000Z" },
      ],
    };

    const steps = buildTimelineSteps(application);
    const byStatus = Object.fromEntries(steps.map((s) => [s.status, s]));
    expect(byStatus.REVIEWING).toMatchObject({
      reached: true,
      timestamp: "2026-08-02T00:00:00.000Z",
    });
    expect(byStatus.SHORTLISTED).toMatchObject({
      reached: true,
      timestamp: "2026-08-04T00:00:00.000Z",
    });
    expect(byStatus.INTERVIEW).toMatchObject({
      reached: false,
      timestamp: null,
    });
  });

  it("appends REJECTED as a terminal step after whichever stage it was rejected from", () => {
    const application: Application = {
      ...baseApplication,
      status: "REJECTED",
      statusEvents: [
        { status: "PENDING", createdAt: "2026-08-01T00:00:00.000Z" },
        { status: "REVIEWING", createdAt: "2026-08-02T00:00:00.000Z" },
        { status: "REJECTED", createdAt: "2026-08-05T00:00:00.000Z" },
      ],
    };

    const steps = buildTimelineSteps(application);
    expect(steps[steps.length - 1]).toMatchObject({
      status: "REJECTED",
      reached: true,
      timestamp: "2026-08-05T00:00:00.000Z",
    });
    // SHORTLISTED/INTERVIEW/OFFERED never happened — still unreached.
    expect(
      steps
        .filter((s) => s.status !== "REJECTED")
        .every((s) => (s.status === "REVIEWING" ? s.reached : !s.reached))
    ).toBe(true);
  });

  it("does not append a terminal step for a still-open application", () => {
    const steps = buildTimelineSteps(baseApplication);
    expect(
      steps.some((s) => s.status === "REJECTED" || s.status === "WITHDRAWN")
    ).toBe(false);
  });
});
