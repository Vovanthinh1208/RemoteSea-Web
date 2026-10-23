import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/core/http/http-client";
import { usersRepository } from "./users.repository";

vi.mock("@/core/http/http-client", () => ({
  apiClient: { delete: vi.fn() },
}));

describe("usersRepository.deleteMyAccount (PB20)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.delete).mockResolvedValue({
      data: { success: true },
    } as never);
  });

  it("sends the deletion confirmation and password to the backend endpoint", async () => {
    await expect(
      usersRepository.deleteMyAccount({
        password: "current-password",
        confirmation: "DELETE",
      })
    ).resolves.toEqual({ success: true });

    expect(apiClient.delete).toHaveBeenCalledWith("/users/me", {
      data: { password: "current-password", confirmation: "DELETE" },
    });
  });

  it("supports deleting an OAuth-only account without a password", async () => {
    await usersRepository.deleteMyAccount({ confirmation: "DELETE" });

    expect(apiClient.delete).toHaveBeenCalledWith("/users/me", {
      data: { confirmation: "DELETE" },
    });
  });
});
