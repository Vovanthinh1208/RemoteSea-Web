import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { resetPassword, verifyResetToken } from "@/features/auth/auth.service";
import { ApiError } from "@/core/errors/api-error";
import { AppRouter } from "@/router/AppRouter";

vi.mock("@/features/auth/auth.service", () => ({
  resetPassword: vi.fn(),
  verifyResetToken: vi.fn(),
}));
vi.mock("@/layouts/RootLayout", () => ({ RootLayout: () => <Outlet /> }));
vi.mock("@/router/GuestOnlyRoute", () => ({
  GuestOnlyRoute: () => <Outlet />,
}));

const renderResetPasswordUrl = (url: string, locale: "en" | "vi" = "en") =>
  render(
    <I18nProvider initialLocale={locale}>
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
  it("loads directly from the email URL and submits its query token when valid", async () => {
    const user = userEvent.setup();
    vi.mocked(verifyResetToken).mockResolvedValue({ valid: true });
    vi.mocked(resetPassword).mockResolvedValue({ message: "Password updated" });

    renderResetPasswordUrl("/reset-password?token=mail-token%26part");

    expect(
      // AppRouter lazy-loads this route. Allow the cold module import to
      // settle on CI/loaded machines before asserting the rendered form.
      await screen.findByRole(
        "heading",
        { name: "Choose a new password" },
        { timeout: 10000 }
      )
    ).toBeInTheDocument();
    expect(await screen.findByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();

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
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Request a new reset link" })
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("PB07-TC02, TC03, TC04: rejects invalid or expired token upfront without displaying reset form", async () => {
    vi.mocked(verifyResetToken).mockRejectedValue(
      new ApiError(400, {
        error: "Invalid or expired password reset token",
        code: "INVALID_OR_EXPIRED_TOKEN",
      })
    );

    renderResetPasswordUrl("/reset-password?token=invalid-or-expired-token");

    // TC02 & TC03: Displays error alert and link to request fresh token
    const alert = await screen.findByRole("alert", undefined, {
      timeout: 10000,
    });
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("This link is invalid or has expired.");
    expect(
      screen.getByRole("link", { name: "Request a new reset link" })
    ).toHaveAttribute("href", "/forgot-password");

    // TC04: Reset password input form must NOT be displayed
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Confirm new password")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset password" })
    ).not.toBeInTheDocument();
  });

  it("offers a fresh reset request when token expires during form submission", async () => {
    const user = userEvent.setup();
    vi.mocked(verifyResetToken).mockResolvedValue({ valid: true });
    vi.mocked(resetPassword).mockRejectedValue(
      new ApiError(400, {
        error: "Invalid or expired password reset token",
        code: "INVALID_OR_EXPIRED_TOKEN",
      })
    );

    renderResetPasswordUrl("/reset-password?token=expired-token");
    await screen.findByRole(
      "heading",
      { name: "Choose a new password" },
      { timeout: 10000 }
    );
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
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });

  it("PB07-TC02, TC03, TC04 (VI): hiển thị thông báo lỗi 'Liên kết không hợp lệ hoặc đã hết hạn' và nút yêu cầu liên kết mới", async () => {
    vi.mocked(verifyResetToken).mockRejectedValue(
      new ApiError(400, {
        error: "Invalid or expired token",
        code: "INVALID_OR_EXPIRED_TOKEN",
      })
    );

    renderResetPasswordUrl("/reset-password?token=sai-token", "vi");

    // PB07-TC02 + PB07-TC03: Từ chối token sai/hết hạn, hiển thị lỗi chuẩn và nút yêu cầu liên kết mới
    const alert = await screen.findByRole("alert", undefined, {
      timeout: 10000,
    });
    expect(alert).toHaveTextContent("Liên kết không hợp lệ hoặc đã hết hạn");
    const linkBtn = screen.getByRole("link", { name: "Yêu cầu liên kết mới" });
    expect(linkBtn).toHaveAttribute("href", "/forgot-password");

    // PB07-TC04: Biểu mẫu nhập Mật khẩu mới và Xác nhận mật khẩu mới KHÔNG được hiển thị
    expect(screen.queryByLabelText("Mật khẩu mới")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Xác nhận mật khẩu mới")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Đặt lại mật khẩu" })
    ).not.toBeInTheDocument();
  });

  it("PB07-TC04 (VI): hiển thị biểu mẫu nhập Mật khẩu mới và Xác nhận mật khẩu mới khi token hợp lệ", async () => {
    vi.mocked(verifyResetToken).mockResolvedValue({ valid: true });

    renderResetPasswordUrl("/reset-password?token=token-hop-le", "vi");

    expect(
      await screen.findByRole(
        "heading",
        { name: "Chọn mật khẩu mới" },
        { timeout: 10000 }
      )
    ).toBeInTheDocument();

    // Biểu mẫu hiển thị đầy đủ các trường
    expect(await screen.findByLabelText("Mật khẩu mới")).toBeInTheDocument();
    expect(screen.getByLabelText("Xác nhận mật khẩu mới")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đặt lại mật khẩu" })
    ).toBeInTheDocument();
  });
});
