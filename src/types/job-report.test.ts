import { describe, expect, it } from "vitest";
import en from "@/i18n/locales/en/jobs.json";
import vi from "@/i18n/locales/vi/jobs.json";
import { JOB_REPORT_REASONS } from "./job-report";

// PB88 AC2: scam/MLM, illegal fee collection, discriminatory content,
// false information, other.
describe("JOB_REPORT_REASONS (PB88)", () => {
  it("offers exactly the PB88 reasons in the report form", () => {
    expect(JOB_REPORT_REASONS).toEqual([
      "SCAM",
      "ILLEGAL_FEE",
      "DISCRIMINATORY",
      "MISLEADING",
      "OTHER",
    ]);
  });

  it("has an EN and VI label for every offered and legacy reason", () => {
    for (const reason of [
      ...JOB_REPORT_REASONS,
      "ALREADY_FILLED",
      "DUPLICATE",
    ] as const) {
      expect(en.report.reason[reason]).toBeTruthy();
      expect(vi.report.reason[reason]).toBeTruthy();
    }
    expect(vi.report.reason.ILLEGAL_FEE).toBe("Thu phí trái phép");
  });
});
