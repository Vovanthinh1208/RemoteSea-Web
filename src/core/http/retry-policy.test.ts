import { describe, expect, it } from "vitest";
import {
  computeBackoffMs,
  isRetryableError,
  RETRY_BASE_DELAY_MS,
} from "@/core/http/retry-policy";

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
  it("grows exponentially, each attempt bounded in [base/2, base)", () => {
    // Inject random extremes to pin the jitter window per attempt.
    const lo = () => 0;
    const hi = () => 0.999;
    for (const [attempt, window] of [
      [1, RETRY_BASE_DELAY_MS],
      [2, RETRY_BASE_DELAY_MS * 2],
      [3, RETRY_BASE_DELAY_MS * 4],
    ] as const) {
      expect(computeBackoffMs(attempt, lo)).toBe(window / 2);
      expect(computeBackoffMs(attempt, hi)).toBeLessThan(window);
      expect(computeBackoffMs(attempt, hi)).toBeGreaterThanOrEqual(window / 2);
    }
  });

  it("spreads concurrent retries instead of firing them in lockstep", () => {
    const values = new Set(
      Array.from({ length: 20 }, () => computeBackoffMs(2))
    );
    // With real Math.random, 20 clients should not all land on one delay.
    expect(values.size).toBeGreaterThan(1);
  });
});
