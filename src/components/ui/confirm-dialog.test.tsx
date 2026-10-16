import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

const setup = () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      cancelLabel="Stay"
      confirmLabel="Leave"
      description="Are you sure?"
      open={false}
      title="Sign out?"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
  return { onConfirm, onCancel };
};

describe("ConfirmDialog", () => {
  it("wires the confirm and cancel buttons to their callbacks", () => {
    const { onConfirm, onCancel } = setup();
    fireEvent.click(screen.getByText("Leave", { selector: "button" }));
    fireEvent.click(screen.getByText("Stay", { selector: "button" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("routes the native Esc/cancel event to onCancel instead of closing itself", () => {
    const { onCancel } = setup();
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("labels the dialog by its title and description", () => {
    setup();
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(dialog.getAttribute("aria-labelledby")).toBe("confirm-dialog-title");
    expect(document.getElementById("confirm-dialog-title")?.textContent).toBe(
      "Sign out?"
    );
  });
});
