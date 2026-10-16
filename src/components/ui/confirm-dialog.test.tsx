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

  it("labels the dialog by its own (unique) title and description ids", () => {
    setup();
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    const labelledBy = dialog.getAttribute("aria-labelledby") as string;
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy)?.textContent).toBe("Sign out?");
    expect(
      document.getElementById(dialog.getAttribute("aria-describedby") as string)
        ?.textContent
    ).toBe("Are you sure?");
  });

  it("renders extra content and keeps the confirm button inert while confirmDisabled", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        confirmDisabled
        cancelLabel="Stay"
        confirmLabel="Leave"
        description="Type your password"
        open={false}
        title="Confirm"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      >
        <input aria-label="Password" type="password" />
      </ConfirmDialog>
    );
    expect(screen.getByLabelText("Password")).toBeTruthy();
    const confirm = screen.getByText("Leave", { selector: "button" });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("gives two dialogs on one page different ids", () => {
    render(
      <>
        <ConfirmDialog
          cancelLabel="a"
          confirmLabel="b"
          description="d1"
          open={false}
          title="t1"
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
        <ConfirmDialog
          cancelLabel="a"
          confirmLabel="b"
          description="d2"
          open={false}
          title="t2"
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>
    );
    const [a, b] = Array.from(document.querySelectorAll("dialog"));
    expect(a.getAttribute("aria-labelledby")).not.toBe(
      b.getAttribute("aria-labelledby")
    );
  });
});
