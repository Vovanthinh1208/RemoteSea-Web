import { describe, expect, it } from "vitest";
import {
  APPLICANT_COLUMNS,
  groupByColumn,
  isApplicantStatusFilter,
} from "./applicant-columns";
import type { ApplicationStatus } from "@/types/application";

describe("applicant board columns (PB57 AC2)", () => {
  it("has the seven backlog columns in pipeline order", () => {
    expect(APPLICANT_COLUMNS.map((c) => c.id)).toEqual([
      "applied",
      "reviewing",
      "shortlisted",
      "interview",
      "offered",
      "hired",
      "rejected",
    ]);
  });

  it("places every status in exactly one column", () => {
    const all: ApplicationStatus[] = [
      "PENDING",
      "REVIEWING",
      "SHORTLISTED",
      "INTERVIEW",
      "OFFERED",
      "OFFER_ACCEPTED",
      "OFFER_DECLINED",
      "REJECTED",
      "WITHDRAWN",
    ];
    const grouped = groupByColumn(all.map((status) => ({ status })));
    const placed = Object.values(grouped).flat();
    expect(placed).toHaveLength(all.length);
    expect(grouped.hired).toEqual([{ status: "OFFER_ACCEPTED" }]);
    expect(grouped.applied).toEqual([{ status: "PENDING" }]);
    expect(grouped.rejected.map((a) => a.status)).toEqual([
      "OFFER_DECLINED",
      "REJECTED",
      "WITHDRAWN",
    ]);
  });

  it("accepts only real statuses as a URL filter", () => {
    expect(isApplicantStatusFilter("SHORTLISTED")).toBe(true);
    expect(isApplicantStatusFilter("HIRED")).toBe(false);
    expect(isApplicantStatusFilter("")).toBe(false);
  });
});
