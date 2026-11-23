import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { RegisterForm } from "./RegisterForm";

const registerAccount = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ registerAccount }),
}));

vi.mock("@/features/auth/components/OAuthButtons", () => ({
  OAuthButtons: () => <div data-testid="oauth-buttons" />,
}));

const renderForm = (locale: "vi" | "en" = "vi") =>
  render(
    <MemoryRouter>
      <I18nProvider initialLocale={locale}>
        <ToastProvider>
          <RegisterForm />
        </ToastProvider>
      </I18nProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RegisterForm Name Validation", () => {
  it("displays validation warning immediately when typing a 1-character name without submitting (Vietnamese)", async () => {
    const user = userEvent.setup();
    renderForm("vi");

    const nameInput = screen.getByLabelText("Họ và tên");
    await user.type(nameInput, "A");

    // Warning must be displayed on the form immediately
    expect(
      await screen.findByText("Tên phải có ít nhất 2 ký tự")
    ).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("aria-invalid", "true");

    // When user types another character to reach 2 characters, warning disappears
    await user.type(nameInput, "n");
    expect(
      screen.queryByText("Tên phải có ít nhất 2 ký tự")
    ).not.toBeInTheDocument();
    expect(nameInput).toHaveAttribute("aria-invalid", "false");
  });

  it("displays warning when entering a 1-character name with surrounding whitespace", async () => {
    const user = userEvent.setup();
    renderForm("vi");

    const nameInput = screen.getByLabelText("Họ và tên");
    await user.type(nameInput, " A ");

    expect(
      await screen.findByText("Tên phải có ít nhất 2 ký tự")
    ).toBeInTheDocument();
  });

  it("displays English validation warning immediately when typing 1 character in English locale", async () => {
    const user = userEvent.setup();
    renderForm("en");

    const nameInput = screen.getByLabelText("Full name");
    await user.type(nameInput, "X");

    expect(
      await screen.findByText("Name must be at least 2 characters")
    ).toBeInTheDocument();
  });
});
