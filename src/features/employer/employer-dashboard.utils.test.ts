import { describe, expect, it } from "vitest";
import { backlogDays } from "./employer-dashboard.utils";

describe("backlogDays", () => {
  const now = new Date("2026-08-14T00:00:00.000Z").getTime();

  it("returns null for a PENDING application within the 3-day threshold", () => {
    expect(
      backlogDays(
        "PENDING",
        "2026-08-12T00:00:00.000Z",
        "2026-08-12T00:00:00.000Z",
        now
      )
    ).toBeNull();
  });

  it("returns the days-stuck count for a PENDING application past the threshold", () => {
    expect(
      backlogDays(
        "PENDING",
        "2026-08-10T00:00:00.000Z",
        "2026-08-10T00:00:00.000Z",
        now
      )
    ).toBe(4);
  });

  it("measures REVIEWING from updatedAt, not appliedAt", () => {
    // Applied long ago, but only just moved into REVIEWING — not backlogged yet.
    expect(
      backlogDays(
        "REVIEWING",
        "2026-07-01T00:00:00.000Z",
        "2026-08-13T00:00:00.000Z",
        now
      )
    ).toBeNull();
  });

  it("returns the days-stuck count for a REVIEWING application past the 7-day threshold", () => {
    expect(
      backlogDays(
        "REVIEWING",
        "2026-07-01T00:00:00.000Z",
        "2026-08-05T00:00:00.000Z",
        now
      )
    ).toBe(9);
  });

  it("returns null for any other status regardless of age", () => {
    expect(
      backlogDays(
        "SHORTLISTED",
        "2026-01-01T00:00:00.000Z",
        "2026-01-01T00:00:00.000Z",
        now
      )
    ).toBeNull();
  });
});
