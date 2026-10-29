import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n";
import { Pagination } from "./Pagination";

const renderPagination = (page: number, pages: number) => {
  const onPageChange = vi.fn();
  render(
    <I18nProvider>
      <Pagination page={page} pages={pages} onPageChange={onPageChange} />
    </I18nProvider>
  );
  return onPageChange;
};

describe("Pagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(
      <I18nProvider>
        <Pagination page={1} pages={1} onPageChange={() => {}} />
      </I18nProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("windows long page lists and keeps prev/next working", () => {
    const onPageChange = renderPagination(6, 30);
    const numbers = screen
      .getAllByRole("button")
      .map((b) => b.textContent)
      .filter((t) => /^\d+$/.test(t ?? ""));
    expect(numbers).toEqual(["1", "5", "6", "7", "30"]);
    fireEvent.click(screen.getByRole("button", { name: /next|trang sau/i }));
    expect(onPageChange).toHaveBeenCalledWith(7);
  });

  // Regression: at 320px the 7-slot window + arrows overflowed horizontally
  // (talent search / job board with many pages). Numbered buttons are
  // hidden below `sm`; a compact "Page X of Y" label replaces them.
  it("hides the numbered window below sm and shows a compact page label instead", () => {
    renderPagination(6, 30);
    const label = screen.getByText(/(page 6 of 30|trang 6\/30)/i);
    expect(label).toHaveClass("sm:hidden");
    const six = screen.getByRole("button", { name: "6" });
    expect(six).toHaveClass("hidden", "sm:grid");
    expect(six).toHaveAttribute("aria-current", "page");
  });
});
