import { describe, expect, it } from "vitest";
import { dropUndefined, toArrayParam } from "@/core/query-params/query-params";

describe("dropUndefined", () => {
  it("removes keys whose value is undefined", () => {
    expect(dropUndefined({ a: 1, b: undefined, c: "x" })).toEqual({
      a: 1,
      c: "x",
    });
  });

  it("keeps falsy-but-defined values", () => {
    expect(dropUndefined({ a: 0, b: "", c: false })).toEqual({
      a: 0,
      b: "",
      c: false,
    });
  });

  it("returns an empty object when everything is undefined", () => {
    expect(dropUndefined({ a: undefined, b: undefined })).toEqual({});
  });
});

describe("toArrayParam", () => {
  it("returns undefined for an empty array", () => {
    expect(toArrayParam([])).toBeUndefined();
  });

  it("returns the array unchanged when non-empty", () => {
    expect(toArrayParam(["a", "b"])).toEqual(["a", "b"]);
  });
});
