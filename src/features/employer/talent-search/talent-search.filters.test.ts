import { describe, expect, it } from "vitest";
import {
  DEFAULT_TALENT_SEARCH_FILTERS,
  countActiveTalentFilters,
  parseTalentSearchQuery,
  serializeTalentSearchQuery,
} from "./talent-search.filters";
import { buildTalentSearchParams } from "./talent-search.service";

describe("talent search max desired salary (PB29)", () => {
  it("round-trips through the URL and counts as an active filter", () => {
    const filters = { ...DEFAULT_TALENT_SEARCH_FILTERS, maxSalary: 2500 };
    const qs = serializeTalentSearchQuery(filters);
    expect(qs).toContain("maxSalary=2500");
    expect(parseTalentSearchQuery(new URLSearchParams(qs)).maxSalary).toBe(
      2500
    );
    expect(countActiveTalentFilters(filters)).toBe(1);
  });

  it("ignores junk values", () => {
    expect(
      parseTalentSearchQuery(new URLSearchParams("maxSalary=-4")).maxSalary
    ).toBeUndefined();
    expect(
      parseTalentSearchQuery(new URLSearchParams("maxSalary=abc")).maxSalary
    ).toBeUndefined();
  });

  it("is sent to GET /talent as maxSalary", () => {
    expect(
      buildTalentSearchParams(
        { ...DEFAULT_TALENT_SEARCH_FILTERS, maxSalary: 1800 },
        12
      ).maxSalary
    ).toBe(1800);
  });
});
