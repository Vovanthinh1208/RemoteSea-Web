import { describe, expect, it } from "vitest";
import { computeBackoffMs, isRetryableError, RETRY_BASE_DELAY_MS } from "@/core/http/retry-policy";

describe("isRetryableError", () => {
  it("retries a GET on a network error", () => {
    expect(isRetryableError("get", undefined, true)).toBe(true);
  });

  it("retries a GET on a 5xx response", () => {
    expect(isRetryableError("get", 503, false)).toBe(true);
  });

  it("does not retry a GET on a 4xx response", () => {
    expect(isRetryableError("get", 404, false)).toBe(false);
  });

  it("does not retry a POST even on a network error", () => {
    expect(isRetryableError("post", undefined, true)).toBe(false);
  });

  it("is case-insensitive on method", () => {
    expect(isRetryableError("GET", 500, false)).toBe(true);
  });
});

describe("computeBackoffMs", () => {
  it("grows exponentially from the base delay", () => {
    expect(computeBackoffMs(1)).toBe(RETRY_BASE_DELAY_MS);
    expect(computeBackoffMs(2)).toBe(RETRY_BASE_DELAY_MS * 2);
    expect(computeBackoffMs(3)).toBe(RETRY_BASE_DELAY_MS * 4);
  });
});
