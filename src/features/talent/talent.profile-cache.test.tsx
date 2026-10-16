import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { talentKeys } from "@/core/query/query-keys";
import type { TalentProfile } from "@/types/talent";

const { updateMyTalentProfile, updateMyName } = vi.hoisted(() => ({
  updateMyTalentProfile: vi.fn(),
  updateMyName: vi.fn(),
}));
vi.mock("@/features/talent/talent.service", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/talent/talent.service")
  >()),
  updateMyTalentProfile,
}));
vi.mock("@/features/users/users.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/users/users.service")>()),
  updateMyName,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ patchUser: vi.fn(), user: null }),
}));

import { useUpdateMyTalentProfile } from "./talent.queries";
import { useUpdateMyName } from "@/features/users/users.queries";

const setup = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  client.setQueryData(talentKeys.mine(), {
    id: "p1",
    slug: "ann",
    user: { name: "Ann" },
  } as unknown as TalentProfile);
  return { client, wrapper };
};

describe("own talent profile cache", () => {
  it("keeps profile.user when a save response comes back without it", async () => {
    const { client, wrapper } = setup();
    updateMyTalentProfile.mockResolvedValue({
      id: "p1",
      slug: "ann",
      bio: "hi",
    });
    const { result } = renderHook(() => useUpdateMyTalentProfile(), {
      wrapper,
    });

    await act(() => result.current.mutateAsync({ bio: "hi" } as never));

    const cached = client.getQueryData<TalentProfile>(talentKeys.mine());
    expect(cached?.bio).toBe("hi");
    expect(cached?.user?.name).toBe("Ann");
  });

  it("updates the cached profile name after the display name is changed", async () => {
    const { client, wrapper } = setup();
    updateMyName.mockResolvedValue({
      id: "u1",
      name: "Ann Lee",
      email: "a@b.c",
    });
    const { result } = renderHook(() => useUpdateMyName(), { wrapper });

    result.current.mutate("Ann Lee");

    await waitFor(() =>
      expect(
        client.getQueryData<TalentProfile>(talentKeys.mine())?.user?.name
      ).toBe("Ann Lee")
    );
  });
});
