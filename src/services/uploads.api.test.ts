import { describe, expect, it } from "vitest";
import { validateFile } from "./uploads.api";

const file = (type: string, size = 1024) =>
  new File([new Uint8Array(size)], "f", { type });

describe("validateFile — company logo (PB30 AC3: PNG/JPG, <= 5 MB)", () => {
  it.each(["image/png", "image/jpeg"])("accepts %s", (type) => {
    expect(validateFile(file(type), "logo")).toBeNull();
  });

  it.each(["image/webp", "image/gif"])("refuses %s", (type) => {
    expect(validateFile(file(type), "logo")).toEqual({
      key: "common.upload.mustBeImage",
    });
  });

  it("refuses a logo over 5 MB", () => {
    expect(
      validateFile(file("image/png", 5 * 1024 * 1024 + 1), "logo")
    ).toEqual({ key: "common.upload.tooLarge", params: { mb: 5 } });
  });

  it("keeps WebP for the cover image", () => {
    expect(validateFile(file("image/webp"), "cover")).toBeNull();
  });
});
