import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteMyAccount } from "./users.queries";

const mocks = vi.hoisted(() => ({
  deleteAccount: vi.fn(),
  logout: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/features/users/users.service", () => ({
  deleteMyAccount: mocks.deleteAccount,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ logout: mocks.logout }),
}));

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteMyAccount (PB20)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteAccount.mockResolvedValue({ success: true });
  });

  it("logs out only after the backend confirms account deletion", async () => {
    const { result } = renderHook(() => useDeleteMyAccount(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ confirmation: "DELETE" });
    });

    expect(mocks.deleteAccount).toHaveBeenCalledWith(
      { confirmation: "DELETE" },
      expect.any(Object)
    );
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    // PB20: home page, replacing /settings in history.
    expect(mocks.navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("keeps the session when the backend rejects deletion", async () => {
    mocks.deleteAccount.mockRejectedValue(new Error("deletion failed"));
    const { result } = renderHook(() => useDeleteMyAccount(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ confirmation: "DELETE" })
      ).rejects.toThrow("deletion failed");
    });

    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
