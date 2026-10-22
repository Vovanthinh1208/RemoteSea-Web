import { describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  authRepository: {
    login: vi.fn(),
    register: vi.fn(),
    getSession: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    oauthUrl: vi.fn(),
    getOAuthProviders: vi.fn(),
  },
}));

vi.mock("@/features/auth/auth.repository", () => repository);

const { getSession, getOAuthProviders } =
  await import("@/features/auth/auth.service");
const { UnauthorizedError, ValidationError } =
  await import("@/core/errors/error-types");

const validUser = {
  id: "user-1",
  email: "a@b.com",
  name: "Ada",
  role: "TALENT" as const,
  permissions: ["TALENT"],
  avatar: null,
};

describe("getSession", () => {
  it("returns the mapped user when a session exists", async () => {
    repository.authRepository.getSession.mockResolvedValueOnce({
      ...validUser,
    });
    await expect(getSession()).resolves.toEqual(validUser);
  });

  it("propagates unauthorized responses so the HTTP client clears the stale token", async () => {
    repository.authRepository.getSession.mockRejectedValueOnce(
      new UnauthorizedError(401, { error: "Unauthorized" })
    );
    await expect(getSession()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("tolerates additive/unknown fields on the user object (loose schema)", async () => {
    repository.authRepository.getSession.mockResolvedValueOnce({
      ...validUser,
      futureField: "some-new-thing",
    });
    await expect(getSession()).resolves.toEqual(validUser);
  });

  it("throws a ValidationError when id/role are missing from the response", async () => {
    repository.authRepository.getSession.mockResolvedValueOnce({
      email: "a@b.com",
      name: "Ada",
    });
    await expect(getSession()).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("getOAuthProviders", () => {
  it("returns the provider list from the API", async () => {
    repository.authRepository.getOAuthProviders.mockResolvedValueOnce({
      providers: ["google", "github"],
    });
    await expect(getOAuthProviders()).resolves.toEqual(["google", "github"]);
  });
});
