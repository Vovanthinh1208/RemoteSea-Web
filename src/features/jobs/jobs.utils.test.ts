import { describe, expect, it, vi } from "vitest";
import { buildActivePills, isVerifiedJob } from "@/features/jobs/jobs.utils";
import { DEFAULT_FILTERS } from "@/features/jobs/job-filters";

describe("buildActivePills", () => {
  it("returns no pills when filters are at their defaults", () => {
    expect(buildActivePills(DEFAULT_FILTERS, undefined, vi.fn())).toEqual([]);
  });

  it("builds one pill per active jobType/seniority/timezone value, with timezone using its display label", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      jobType: ["Full-time"],
      seniority: ["Senior"],
      timezone: ["sea"],
    };

    const pills = buildActivePills(filters, undefined, vi.fn());

    expect(pills.map((p) => p.label)).toEqual([
      "Full-time",
      "Senior",
      "SEA / APAC",
    ]);
  });

  it("resolves a category slug to its display name via the categories list", () => {
    const filters = { ...DEFAULT_FILTERS, category: ["engineering"] };
    const categories = [{ slug: "engineering", name: "Engineering" }];

    const pills = buildActivePills(filters, categories, vi.fn());

    expect(pills).toEqual([expect.objectContaining({ label: "Engineering" })]);
  });

  it("falls back to the raw slug when categories haven't loaded yet", () => {
    const filters = { ...DEFAULT_FILTERS, category: ["engineering"] };

    const pills = buildActivePills(filters, undefined, vi.fn());

    expect(pills[0]?.label).toBe("engineering");
  });

  it("adds a salary pill only once the range is off its default floor/ceiling", () => {
    const atDefault = buildActivePills(DEFAULT_FILTERS, undefined, vi.fn());
    expect(atDefault).toEqual([]);

    const narrowed = buildActivePills(
      { ...DEFAULT_FILTERS, salaryMin: 1000, salaryMax: 5000 },
      undefined,
      vi.fn()
    );
    expect(narrowed).toHaveLength(1);
  });

  it("clearing a pill calls onChange with that value removed and everything else intact", () => {
    const onChange = vi.fn();
    const filters = {
      ...DEFAULT_FILTERS,
      jobType: ["Full-time", "Contract"],
    };

    const pills = buildActivePills(filters, undefined, onChange);
    pills.find((p) => p.label === "Full-time")?.clear();

    expect(onChange).toHaveBeenCalledWith({
      ...filters,
      jobType: ["Contract"],
    });
  });
});

describe("isVerifiedJob", () => {
  const verifiedEmployer = { isVerified: true };
  const baseJob = {
    description: "x".repeat(100),
    salaryMin: 1000,
    categories: [{ category: { id: "c1" } }],
    employer: verifiedEmployer,
  };

  it("passes when the employer is verified and all criteria are met", () => {
    expect(isVerifiedJob(baseJob)).toBe(true);
  });

  it("fails when the employer isn't verified", () => {
    expect(isVerifiedJob({ ...baseJob, employer: { isVerified: false } })).toBe(
      false
    );
  });

  it("fails when salaryMin is null", () => {
    expect(isVerifiedJob({ ...baseJob, salaryMin: null })).toBe(false);
  });

  it("fails when there are no categories", () => {
    expect(isVerifiedJob({ ...baseJob, categories: [] })).toBe(false);
  });

  it("fails when the description is too short", () => {
    expect(isVerifiedJob({ ...baseJob, description: "too short" })).toBe(false);
  });

  it("skips the description check when the field isn't present (board card payload)", () => {
    expect(
      isVerifiedJob({
        salaryMin: baseJob.salaryMin,
        categories: baseJob.categories,
        employer: baseJob.employer,
      })
    ).toBe(true);
  });
});
