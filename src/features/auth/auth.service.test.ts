import { describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  authRepository: {
    login: vi.fn(),
    register: vi.fn(),
    getSession: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    oauthUrl: vi.fn(),
  },
}));

vi.mock("@/features/auth/auth.repository", () => repository);

const { getSession } = await import("@/features/auth/auth.service");
const { ValidationError } = await import("@/core/errors/error-types");

const validUser = {
  id: "user-1",
  email: "a@b.com",
  name: "Ada",
  role: "TALENT" as const,
};

describe("getSession", () => {
  it("returns the mapped user when a session exists", async () => {
    repository.authRepository.getSession.mockResolvedValueOnce({
      user: validUser,
    });
    await expect(getSession()).resolves.toEqual(validUser);
  });

  it("returns null when there is no session (the 401 -> null contract AuthContext relies on)", async () => {
    repository.authRepository.getSession.mockResolvedValueOnce({
      user: null,
    });
    await expect(getSession()).resolves.toBeNull();
  });

  it("tolerates additive/unknown fields on the user object (loose schema)", async () => {
    repository.authRepository.getSession.mockResolvedValueOnce({
      user: { ...validUser, futureField: "some-new-thing" },
    });
    await expect(getSession()).resolves.toEqual(validUser);
  });

  it("throws a ValidationError when id/role are missing from the response", async () => {
    repository.authRepository.getSession.mockResolvedValueOnce({
      user: { email: "a@b.com", name: "Ada" },
    });
    await expect(getSession()).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});
