import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { forgotPassword } from "@/features/auth/auth.service";
import { ApiError } from "@/core/errors/api-error";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

vi.mock("@/features/auth/auth.service", () => ({
  forgotPassword: vi.fn(),
}));

const renderForm = (locale: "en" | "vi" = "en") =>
  render(
    <I18nProvider initialLocale={locale}>
      <ToastProvider>
        <ForgotPasswordForm />
      </ToastProvider>
    </I18nProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ForgotPasswordForm", () => {
  it("offers an Open Gmail button after the reset request succeeds", async () => {
    const user = userEvent.setup();
    vi.mocked(forgotPassword).mockResolvedValue({
      message: "If the account exists, an email has been sent.",
    });

    renderForm();

    await user.type(screen.getByLabelText("Email address"), "person@gmail.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(
      await screen.findByText(
        "We've sent a password reset link to person@gmail.com if an account exists."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Gmail" })).toHaveAttribute(
      "href",
      "https://mail.google.com/mail/u/0/#inbox"
    );
    expect(screen.getByRole("link", { name: "Open Gmail" })).toHaveAttribute(
      "target",
      "_blank"
    );
  });

  it("PB06-TC06: displays rate limit error message when API rejects with RATE_LIMITED", async () => {
    const user = userEvent.setup();
    vi.mocked(forgotPassword).mockRejectedValue(
      new ApiError(429, {
        error: "Too many requests. Please slow down and try again shortly.",
        code: "RATE_LIMITED",
      })
    );

    renderForm();

    await user.type(screen.getByLabelText("Email address"), "spam@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many requests. Please wait a moment and try again."
    );
  });

  it("PB06-TC08: renders properly in Vietnamese locale and validates input before submission", async () => {
    const user = userEvent.setup();
    renderForm("vi");

    expect(screen.getByLabelText("Địa chỉ email")).toBeInTheDocument();
    const submitButton = screen.getByRole("button", {
      name: "Gửi liên kết đặt lại",
    });
    expect(submitButton).toBeInTheDocument();

    // Click submit with empty email
    await user.click(submitButton);

    // API should not be called when input is invalid
    expect(forgotPassword).not.toHaveBeenCalled();

    // Type invalid email
    await user.type(screen.getByLabelText("Địa chỉ email"), "notanemail");
    await user.click(submitButton);

    expect(forgotPassword).not.toHaveBeenCalled();
  });
});
