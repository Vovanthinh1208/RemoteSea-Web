import { describe, expect, it } from "vitest";
import { toTalentSearchResponse } from "@/features/employer/talent-search/talent-search.mapper";
import type { TalentSearchResponseDto } from "@/features/employer/talent-search/talent-search.dto";

const responseDto: TalentSearchResponseDto = {
  talents: [
    {
      id: "talent-1",
      slug: "jane-doe-a1b2c3",
      headline: "Senior Backend Engineer",
      level: "SENIOR",
      country: "Vietnam",
      timezone: "Asia/Ho_Chi_Minh",
      yearsExperience: 8,
      desiredSalaryMin: 90000,
      desiredSalaryMax: 130000,
      currency: "USD",
      employmentTypes: ["FULL_TIME"],
      timezoneOverlap: ["SG_HOURS"],
      updatedAt: "2026-06-30T14:02:31.000Z",
      user: { name: "Jane Doe", image: null },
      skills: [{ skill: { id: "s1", name: "Node.js", slug: "node-js" } }],
    },
  ],
  pagination: { page: 1, limit: 20, total: 1, pages: 1 },
};

describe("talent-search.mapper", () => {
  it("toTalentSearchResponse passes the DTO through unchanged (identity mapping)", () => {
    expect(toTalentSearchResponse(responseDto)).toBe(responseDto);
  });
});
