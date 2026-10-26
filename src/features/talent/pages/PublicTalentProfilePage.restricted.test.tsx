import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicTalentProfilePage } from "./PublicTalentProfilePage";
import { usePublicTalentProfile } from "@/features/talent/talent.queries";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/core/errors/api-error";

vi.mock("@/features/talent/talent.queries");
vi.mock("@/contexts/AuthContext");

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={["/talent/ada"]}>
      <Routes>
        <Route element={<PublicTalentProfilePage />} path="/talent/:slug" />
      </Routes>
    </MemoryRouter>
  );

const restricted = () =>
  vi.mocked(usePublicTalentProfile).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
    error: new ApiError(403, {
      error: "restricted",
      code: "TALENT_PROFILE_RESTRICTED",
    }),
  } as never);

// PB28 AC2.2 / AC2.3.
describe("PublicTalentProfilePage gated profile", () => {
  it("asks a guest to sign in as a Verified Employer", () => {
    restricted();
    vi.mocked(useAuth).mockReturnValue({ user: null } as never);
    renderAt();
    expect(
      screen.getByRole("heading", { name: /verified employers only/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign in as a verified employer/i })
    ).toHaveAttribute("href", "/login");
  });

  it("asks an unverified employer to verify the company", () => {
    restricted();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u1", role: "EMPLOYER" },
    } as never);
    renderAt();
    expect(
      screen.getByRole("link", { name: /verify your company/i })
    ).toBeInTheDocument();
  });

  it("still shows Not Found for a missing profile", () => {
    vi.mocked(usePublicTalentProfile).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(404, {
        error: "nf",
        code: "TALENT_PROFILE_NOT_FOUND",
      }),
    } as never);
    vi.mocked(useAuth).mockReturnValue({ user: null } as never);
    renderAt();
    expect(
      screen.queryByRole("heading", { name: /verified employers only/i })
    ).toBeNull();
  });
});
