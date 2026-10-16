import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n";
import { ToggleRow } from "./ToggleRow";
import { ToggleRow as ProfileToggleRow } from "@/features/talent/components/profile-form/ToggleRow";

describe("ToggleRow accessibility", () => {
  it.each([
    ["settings", ToggleRow],
    ["profile", ProfileToggleRow],
  ])("%s toggle is a named switch whose name is its title", (_, Row) => {
    const onChange = vi.fn();
    render(
      <I18nProvider>
        <Row
          desc="Emails about your applications"
          on={false}
          title="Application updates"
          onChange={onChange}
        />
      </I18nProvider>
    );
    const toggle = screen.getByRole("switch", { name: "Application updates" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(toggle.getAttribute("aria-describedby")).toBeTruthy();
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
