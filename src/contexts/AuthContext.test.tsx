import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/core/token/token-storage";
import { sessionKeys } from "@/core/query/query-keys";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("@/core/http/http-client", () => ({
  registerUnauthorizedHandler: vi.fn(() => vi.fn()),
}));

vi.mock("@/features/auth/auth.service", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const privateKeys = [
  ["talent", "mine"],
  ["users", "account"],
] as const;

describe("AuthProvider private cache cleanup", () => {
  let queryClient: QueryClient;
  let logout: (() => void) | undefined;

  const Consumer = () => {
    logout = useAuth().logout;
    return null;
  };

  const renderProvider = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </QueryClientProvider>
    );

  beforeEach(() => {
    clearAccessToken();
    logout = undefined;
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("removes private query data and credentials when logout runs", async () => {
    setAccessToken("test-access-token", true);
    privateKeys.forEach((key) =>
      queryClient.setQueryData(key, { private: true })
    );
    queryClient.setQueryData(sessionKeys.all, { id: "deleted-user" });

    const wrapper = renderProvider();
    await waitFor(() => expect(logout).toBeTypeOf("function"));

    act(() => logout?.());

    expect(getAccessToken()).toBeNull();
    privateKeys.forEach((key) =>
      expect(queryClient.getQueryData(key)).toBeUndefined()
    );
    expect(queryClient.getQueryData(sessionKeys.all)).toBeNull();
    wrapper.unmount();
  });

  it("removes private caches when another tab clears the access token", async () => {
    privateKeys.forEach((key) =>
      queryClient.setQueryData(key, { private: true })
    );
    renderProvider();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "remotesea_access_token",
          newValue: null,
        })
      );
    });

    privateKeys.forEach((key) =>
      expect(queryClient.getQueryData(key)).toBeUndefined()
    );
    expect(queryClient.getQueryData(sessionKeys.all)).toBeNull();
  });

  it("clears sessionStorage credentials and private caches on the logout signal", async () => {
    setAccessToken("session-only-token", false);
    privateKeys.forEach((key) =>
      queryClient.setQueryData(key, { private: true })
    );
    renderProvider();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "remotesea_logout_signal",
          newValue: "logout-event",
        })
      );
    });

    expect(getAccessToken()).toBeNull();
    privateKeys.forEach((key) =>
      expect(queryClient.getQueryData(key)).toBeUndefined()
    );
    expect(queryClient.getQueryData(sessionKeys.all)).toBeNull();
  });
});
