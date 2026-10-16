import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "@/core/errors/api-error";
import { NetworkError } from "@/core/errors/error-types";
import { getErrorMessage } from "@/core/errors/localize";
import { setRuntimeLocale } from "@/i18n/runtime";

describe("getErrorMessage", () => {
  beforeEach(() => setRuntimeLocale("en"));

  it("maps the stable error code, not the English server text", () => {
    const err = new ApiError(409, {
      error: "Anything the server says",
      code: "ALREADY_APPLIED",
    });
    expect(getErrorMessage(err)).toBe("You've already applied to this job.");
    setRuntimeLocale("vi");
    expect(getErrorMessage(err)).toBe("Bạn đã ứng tuyển việc làm này rồi.");
  });

  it("falls back to the HTTP status for unknown codes", () => {
    const err = new ApiError(403, { error: "x", code: "SOMETHING_NEW" });
    setRuntimeLocale("vi");
    expect(getErrorMessage(err)).toBe(
      "Bạn không có quyền thực hiện thao tác này."
    );
  });

  it("handles network failures and non-API errors", () => {
    expect(getErrorMessage(new NetworkError({}))).toBe(
      "Network error. Please check your connection."
    );
    expect(getErrorMessage(new Error("boom"))).toBe(
      "Something went wrong. Please try again."
    );
    expect(getErrorMessage(new Error("boom"), "Custom")).toBe("Custom");
  });
});
