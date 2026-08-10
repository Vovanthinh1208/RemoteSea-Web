import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./token-storage";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe("token-storage", () => {
  it("round-trips a remembered token via localStorage", () => {
    setAccessToken("tok", true);
    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe("tok");
    expect(getAccessToken()).toBe("tok");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("uses sessionStorage when not remembered", () => {
    setAccessToken("tok", false);
    expect(sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe("tok");
    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("returns null instead of throwing when storage access throws (Safari private mode)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied");
    });
    expect(() => getAccessToken()).not.toThrow();
    expect(getAccessToken()).toBeNull();
  });

  it("swallows setItem failures (quota/blocked) instead of crashing the caller", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota");
    });
    expect(() => setAccessToken("tok", true)).not.toThrow();
  });
});
