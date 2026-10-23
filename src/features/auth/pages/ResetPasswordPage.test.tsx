import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { resetPassword } from "@/features/auth/auth.service";
import { ApiError } from "@/core/errors/api-error";
import { AppRouter } from "@/router/AppRouter";

vi.mock("@/features/auth/auth.service", () => ({
  resetPassword: vi.fn(),
}));
vi.mock("@/layouts/RootLayout", () => ({ RootLayout: () => <Outlet /> }));
vi.mock("@/router/GuestOnlyRoute", () => ({
  GuestOnlyRoute: () => <Outlet />,
}));

const renderResetPasswordUrl = (url: string) =>
  render(
    <I18nProvider initialLocale="en">
      <ToastProvider>
        <MemoryRouter initialEntries={[url]}>
          <AppRouter />
        </MemoryRouter>
      </ToastProvider>
    </I18nProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ResetPasswordPage", () => {
  it("loads directly from the email URL and submits its query token", async () => {
    const user = userEvent.setup();
    vi.mocked(resetPassword).mockResolvedValue({ message: "Password updated" });

    renderResetPasswordUrl("/reset-password?token=mail-token%26part");

    expect(
      await screen.findByRole("heading", { name: "Choose a new password" })
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("New password"), "SafePass123!");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "SafePass123!"
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(resetPassword).toHaveBeenCalledWith({
      token: "mail-token&part",
      password: "SafePass123!",
    });
  });

  it("shows the invalid-token state when opened without an email token", async () => {
    renderResetPasswordUrl("/reset-password");

    expect(
      await screen.findByText(
        "This reset link is invalid or missing its token. Request a new one."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Request a new reset link" })
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("offers a fresh reset request when the API rejects an expired token", async () => {
    const user = userEvent.setup();
    vi.mocked(resetPassword).mockRejectedValue(
      new ApiError(400, {
        error: "Invalid or expired password reset token",
        code: "INVALID_OR_EXPIRED_TOKEN",
      })
    );

    renderResetPasswordUrl("/reset-password?token=expired-token");
    await screen.findByRole("heading", { name: "Choose a new password" });
    await user.type(screen.getByLabelText("New password"), "SafePass123!");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "SafePass123!"
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Request a new reset link" })
    ).toHaveAttribute("href", "/forgot-password");
  });
});
