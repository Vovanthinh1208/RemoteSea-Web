import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { TwoFactorSection } from "./TwoFactorSection";

const mocks = vi.hoisted(() => ({
  enabled: true,
  disable: vi.fn(),
  setup: vi.fn(),
  verify: vi.fn(),
}));

vi.mock("@/features/auth/auth.queries", () => ({
  useTwoFactorStatus: vi.fn(() => ({ data: { enabled: mocks.enabled } })),
  useSetupTwoFactor: vi.fn(() => ({
    mutateAsync: mocks.setup,
    isPending: false,
  })),
  useVerifyTwoFactorSetup: vi.fn(() => ({
    mutateAsync: mocks.verify,
    isPending: false,
  })),
  useDisableTwoFactor: vi.fn(() => ({
    mutateAsync: mocks.disable,
    isPending: false,
  })),
}));

const renderSection = () =>
  render(
    <I18nProvider initialLocale="en">
      <ToastProvider>
        <TwoFactorSection />
      </ToastProvider>
    </I18nProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.enabled = true;
  mocks.disable.mockResolvedValue(undefined);
});

describe("TwoFactorSection — disabling (PB11)", () => {
  // AC2: a security-risk warning, then the current password (RC1).
  it("warns about the risk and asks for the password before disabling", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(
      screen.getByRole("switch", { name: "Two-factor authentication" })
    );

    const dialog = screen.getByRole("alertdialog", {
      name: "Turn off two-factor authentication?",
    });
    expect(dialog).toHaveAccessibleDescription(
      /anyone who learns it can sign in/i
    );
    expect(screen.getByRole("button", { name: "Disable" })).toBeDisabled();
    expect(mocks.disable).not.toHaveBeenCalled();
  });

  it("sends the typed password to the disable call", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(
      screen.getByRole("switch", { name: "Two-factor authentication" })
    );
    await user.type(screen.getByLabelText("Password"), "Current123!");
    await user.click(screen.getByRole("button", { name: "Disable" }));

    expect(mocks.disable).toHaveBeenCalledWith(
      expect.objectContaining({ password: "Current123!" })
    );
  });
});
