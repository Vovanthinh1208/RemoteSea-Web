import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n/I18nContext";
import { VerifyEmailBanner } from "./VerifyEmailBanner";

const mocks = vi.hoisted(() => ({ submit: vi.fn() }));

vi.mock("@/features/talent/talent.queries", () => ({
  useSubmitTalentVerification: vi.fn(() => ({
    mutateAsync: mocks.submit,
    isPending: false,
  })),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({ user: { email: "jane@example.com" } })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.submit.mockResolvedValue(undefined);
});

describe("VerifyEmailBanner (PB22 AC1)", () => {
  // Only the account's own address can be verified, so it is prefilled and
  // sending is a single click.
  it("prefills the account email and sends it in one click", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <VerifyEmailBanner
          verificationEmail={null}
          verificationStatus="NOT_SUBMITTED"
        />
      </I18nProvider>
    );

    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
    await user.click(
      screen.getByRole("button", { name: "Send verification email" })
    );
    expect(mocks.submit).toHaveBeenCalledWith("jane@example.com");
  });
});
