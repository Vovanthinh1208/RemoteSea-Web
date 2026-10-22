import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { forgotPassword } from "@/features/auth/auth.service";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

vi.mock("@/features/auth/auth.service", () => ({
  forgotPassword: vi.fn(),
}));

const renderForm = () =>
  render(
    <I18nProvider initialLocale="en">
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
});
