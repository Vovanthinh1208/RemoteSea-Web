import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { ChangePasswordForm } from "./ChangePasswordForm";

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn() }));

vi.mock("@/features/users/users.queries", () => ({
  useChangeMyPassword: vi.fn(() => ({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
  })),
}));

const renderForm = () =>
  render(
    <I18nProvider initialLocale="en">
      <ToastProvider>
        <ChangePasswordForm />
      </ToastProvider>
    </I18nProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mutateAsync.mockResolvedValue({ message: "Password updated" });
});

describe("ChangePasswordForm (PB12)", () => {
  it("requires a matching confirmation before calling the password API", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "Current123!");
    await user.type(screen.getByLabelText("New password"), "NewPass123!");
    await user.type(screen.getByLabelText("Confirm password"), "Different123!");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Passwords don't match"
    );
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("rejects a new password shorter than eight characters", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "Current123!");
    await user.type(screen.getByLabelText("New password"), "short7!");
    await user.type(screen.getByLabelText("Confirm password"), "short7!");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(
      await screen.findByText("New password must be at least 8 characters")
    ).toBeInTheDocument();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("sends only the API contract fields when the new password is confirmed", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "Current123!");
    await user.type(screen.getByLabelText("New password"), "NewPass123!");
    await user.type(screen.getByLabelText("Confirm password"), "NewPass123!");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      currentPassword: "Current123!",
      newPassword: "NewPass123!",
    });
  });
});
