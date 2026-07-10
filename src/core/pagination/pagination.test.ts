import { describe, expect, it } from "vitest";
import { buildPageParams } from "@/core/pagination/pagination";

describe("buildPageParams", () => {
  it("passes page and limit through unchanged", () => {
    expect(buildPageParams({ page: 2, limit: 20 })).toEqual({ page: 2, limit: 20 });
  });
});
