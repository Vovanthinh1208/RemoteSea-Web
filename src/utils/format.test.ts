import { describe, expect, it } from "vitest";
import { formatSalaryRange } from "./format";

describe("formatSalaryRange", () => {
  it("formats a full range with the default $ prefix", () => {
    expect(formatSalaryRange(1000, 2500)).toBe("$1,000–2,500");
  });

  it("formats an open-ended minimum", () => {
    expect(formatSalaryRange(3000, null)).toBe("$3,000+");
  });

  it("formats a max-only range", () => {
    expect(formatSalaryRange(null, 4000)).toBe("Up to $4,000");
  });

  it('returns null when neither bound is present — never "$0–0"', () => {
    expect(formatSalaryRange(null, null)).toBeNull();
    expect(formatSalaryRange(undefined, undefined)).toBeNull();
  });

  it("supports a currency-word prefix", () => {
    expect(formatSalaryRange(1000, 2000, { prefix: "USD " })).toBe(
      "USD 1,000–2,000"
    );
  });
});
