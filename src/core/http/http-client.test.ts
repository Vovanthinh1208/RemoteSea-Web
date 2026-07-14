import { beforeEach, describe, expect, it, vi } from "vitest";

const tokenStorage = vi.hoisted(() => ({
  getAccessToken: vi.fn<() => string | null>(() => null),
  clearAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
}));

vi.mock("@/core/token/token-storage", () => tokenStorage);

// Imported after the mock so http-client.ts picks up the mocked token storage.
const { apiClient, registerUnauthorizedHandler } = await import("@/core/http/http-client");
const { UnauthorizedError, NotFoundError } = await import("@/core/errors/error-types");

const rejectedHandler = () => {
  const handler = apiClient.interceptors.response.handlers?.[0]?.rejected;
  if (!handler) throw new Error("response interceptor not registered");
  return handler;
};

const axiosError = (overrides: Record<string, unknown>) => ({
  isAxiosError: true,
  config: { method: "get" },
  ...overrides,
});

describe("http-client response interceptor", () => {
  beforeEach(() => {
    tokenStorage.clearAccessToken.mockClear();
  });

  it("rejects a canceled request without retrying or mapping it to an ApiError", async () => {
    const canceled = axiosError({ code: "ERR_CANCELED" });
    await expect(rejectedHandler()(canceled)).rejects.toBe(canceled);
  });

  it("maps a 401 to UnauthorizedError, clears the token, and calls the unauthorized handler", async () => {
    const onUnauthorized = vi.fn();
    const unregister = registerUnauthorizedHandler(onUnauthorized);

    const error = axiosError({
      config: { method: "post" }, // non-retryable method, so the 401 branch is reached directly
      response: { status: 401, data: { error: "Unauthorized" } },
    });

    await expect(rejectedHandler()(error)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(tokenStorage.clearAccessToken).toHaveBeenCalledOnce();
    expect(onUnauthorized).toHaveBeenCalledOnce();

    unregister();
  });

  it("maps a non-retryable 404 to NotFoundError", async () => {
    const error = axiosError({
      config: { method: "post" },
      response: { status: 404, data: { error: "Not found" } },
    });

    await expect(rejectedHandler()(error)).rejects.toBeInstanceOf(NotFoundError);
  });
});
