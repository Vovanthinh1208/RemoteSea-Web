import { describe, expect, it } from "vitest";
import { selectVisibleSprints } from "./sprint-visibility";
import { ALL_SPRINTS } from "./sprints.data";

const ids = (raw?: string) =>
  selectVisibleSprints(ALL_SPRINTS, raw).map((s) => s.id);

describe("selectVisibleSprints", () => {
  it("shows only Sprint 1 by default and for blank values", () => {
    expect(ids()).toEqual([1]);
    expect(ids("")).toEqual([1]);
    expect(ids("  ")).toEqual([1]);
  });

  it("restores every sprint with 'all' (case-insensitive)", () => {
    expect(ids("all")).toEqual([1, 2, 3, 4]);
    expect(ids("ALL")).toEqual([1, 2, 3, 4]);
  });

  it("accepts a comma list and ignores junk entries", () => {
    expect(ids("1, 3")).toEqual([1, 3]);
    expect(ids("2,x,,")).toEqual([2]);
  });

  it("returns nothing for an unknown sprint instead of falling back silently", () => {
    expect(ids("9")).toEqual([]);
  });

  it("never mutates or drops the underlying data", () => {
    ids("1");
    expect(ALL_SPRINTS.map((s) => s.id)).toEqual([1, 2, 3, 4]);
  });
});

describe("generated sprint data", () => {
  it("lists PB01–PB22 in order for Sprint 1", () => {
    const sprint1 = ALL_SPRINTS.find((s) => s.id === 1);
    expect(sprint1?.pbis.map((p) => p.id)).toEqual(
      Array.from(
        { length: 22 },
        (_, i) => `PB${String(i + 1).padStart(2, "0")}`
      )
    );
    expect(sprint1?.pbis.every((p) => p.title.length > 0)).toBe(true);
  });

  it("assigns every PBI to exactly one sprint", () => {
    const all = ALL_SPRINTS.flatMap((s) => s.pbis.map((p) => p.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(96);
  });
});
