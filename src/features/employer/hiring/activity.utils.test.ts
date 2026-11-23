import { describe, expect, it } from "vitest";
import { buildActivityEvents } from "./activity.utils";
import type { ApplicantWithJob } from "@/features/employer/employer.queries";
import type { Scorecard } from "@/types/scorecard";

const applicant = {
  appliedAt: "2026-08-18T09:00:00.000Z",
  viewedAt: null,
} as unknown as ApplicantWithJob;

describe("buildActivityEvents — scorecard entries", () => {
  it.each([
    ["STRONGLY_RECOMMEND", "Definite hire"],
    ["RECOMMEND", "Hire"],
    ["NEUTRAL", "Neutral"],
    ["NOT_RECOMMEND", "No hire"],
    ["STRONGLY_NOT_RECOMMEND", "Strong no"],
  ])("labels %s as %s instead of a raw i18n key", (recommendation, label) => {
    const scorecard = {
      id: "sc-1",
      author: { name: "Bui Ngoc Lan" },
      recommendation,
      createdAt: "2026-08-19T09:00:00.000Z",
    } as unknown as Scorecard;

    const events = buildActivityEvents(applicant, null, [scorecard]);
    const feedback = events.find((e) => e.id === "scorecard-sc-1");

    expect(feedback?.label).toBe(`Bui Ngoc Lan submitted feedback (${label})`);
  });
});
