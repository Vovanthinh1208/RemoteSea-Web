import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DeleteAccountButton } from "./DeleteAccountButton";

const mocks = vi.hoisted(() => ({ deleteAccount: vi.fn() }));

vi.mock("@/features/users/users.queries", () => ({
  useDeleteMyAccount: () => ({
    isPending: false,
    mutateAsync: mocks.deleteAccount,
  }),
}));

vi.mock("@/hooks/useToastMutation", () => ({
  useToastMutation: () => async (action: () => Promise<unknown>) => {
    try {
      await action();
      return true;
    } catch {
      return false;
    }
  },
}));

vi.mock("@/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("DeleteAccountButton (PB20)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteAccount.mockResolvedValue({ success: true });
  });

  it("requires the exact DELETE confirmation and submits to the deletion mutation", async () => {
    const { container } = render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: "del.button" }));
    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0], {
      target: { value: "current-password" },
    });
    fireEvent.change(inputs[1], {
      target: { value: "delete" },
    });

    const confirmButton = screen.getByRole("button", { name: "del.confirm" });
    expect(confirmButton).toBeDisabled();
    expect(mocks.deleteAccount).not.toHaveBeenCalled();

    fireEvent.change(inputs[1], {
      target: { value: "DELETE" },
    });
    fireEvent.click(confirmButton);

    expect(mocks.deleteAccount).toHaveBeenCalledWith({
      password: "current-password",
      confirmation: "DELETE",
    });
  });

  it("lets the user cancel before sending any deletion request", () => {
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: "del.button" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "DELETE" },
    });
    fireEvent.click(screen.getByRole("button", { name: "actions.cancel" }));

    expect(screen.queryByText("del.confirmLabel")).not.toBeInTheDocument();
    expect(mocks.deleteAccount).not.toHaveBeenCalled();
  });

  it("sends a single deletion request when the form is submitted twice in quick succession", async () => {
    let resolve: (value: unknown) => void = () => undefined;
    mocks.deleteAccount.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: "del.button" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "DELETE" },
    });
    const confirmButton = screen.getByRole("button", { name: "del.confirm" });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    expect(mocks.deleteAccount).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve({ success: true });
    });
  });

  it("keeps the confirmation form open when the backend rejects the deletion", async () => {
    mocks.deleteAccount.mockRejectedValue(
      new Error("Current password is incorrect")
    );
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: "del.button" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "DELETE" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "del.confirm" }));
    });

    expect(mocks.deleteAccount).toHaveBeenCalledTimes(1);
    expect(screen.getByText("del.confirmLabel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "del.confirm" })).toBeEnabled();
  });
});
