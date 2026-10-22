import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import {
  I18nProvider,
  LOCALE_PENDING_SYNC_KEY,
  LOCALES_STORAGE_KEY,
} from "@/i18n";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const renderSwitcher = (variant?: "desktop" | "mobile") =>
  render(
    <I18nProvider initialLocale="en">
      <input aria-label="draft" defaultValue="" />
      <LanguageSwitcher variant={variant} />
    </I18nProvider>
  );

describe("LanguageSwitcher", () => {
  afterEach(() => localStorage.clear());

  it("switches with the mouse, updates its own label and marks the choice for account sync", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(
      screen.getByRole("button", { name: "Select display language" })
    );
    expect(screen.getByRole("option", { name: "English" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await user.click(screen.getByRole("option", { name: "Tiếng Việt" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", {
      name: "Chọn ngôn ngữ hiển thị",
    });
    expect(trigger).toHaveTextContent("Tiếng Việt");
    expect(trigger).toHaveFocus();
    expect(document.documentElement.lang).toBe("vi");
    expect(localStorage.getItem(LOCALES_STORAGE_KEY)).toBe("vi");
    expect(localStorage.getItem(LOCALE_PENDING_SYNC_KEY)).toBe("1");
  });

  it("is fully operable from the keyboard", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    const trigger = screen.getByRole("button", {
      name: "Select display language",
    });

    trigger.focus();
    await user.keyboard("{ArrowDown}");
    const listbox = screen.getByRole("listbox");
    expect(trigger).toHaveAttribute("aria-controls", listbox.id);
    // Focus lands on the current language, arrows move, Enter selects.
    expect(screen.getByRole("option", { name: "English" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Tiếng Việt" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "English" })).toHaveFocus();
    await user.keyboard("{End}{Enter}");

    expect(document.documentElement.lang).toBe("vi");
    expect(
      screen.getByRole("button", { name: "Chọn ngôn ngữ hiển thị" })
    ).toHaveFocus();
  });

  it("Escape closes the list without changing language and returns focus", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    const trigger = screen.getByRole("button", {
      name: "Select display language",
    });

    await user.click(trigger);
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.documentElement.lang).toBe("en");
  });

  it("marks each option with its language for screen readers", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.click(
      screen.getByRole("button", { name: "Select display language" })
    );
    expect(screen.getByRole("option", { name: "Tiếng Việt" })).toHaveAttribute(
      "lang",
      "vi"
    );
    expect(screen.getByRole("option", { name: "English" })).toHaveAttribute(
      "lang",
      "en"
    );
  });

  it("does not touch other inputs on the page when switching", async () => {
    const user = userEvent.setup();
    renderSwitcher("mobile");
    await user.type(
      screen.getByLabelText("draft"),
      "half-written cover letter"
    );
    await user.click(screen.getByRole("button", { name: "Tiếng Việt" }));

    expect(screen.getByRole("button", { name: "Tiếng Việt" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByLabelText("draft")).toHaveValue(
      "half-written cover letter"
    );
  });
});
