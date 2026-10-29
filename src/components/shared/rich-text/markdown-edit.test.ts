import { describe, expect, it } from "vitest";
import { applyMarkdownAction } from "./markdown-edit";

const sel = (value: string, start: number, end = start) => ({
  value,
  start,
  end,
});

describe("applyMarkdownAction", () => {
  it("wraps the selection in bold and keeps the inner text selected", () => {
    const r = applyMarkdownAction(sel("Build APIs", 6, 10), "bold", "text");
    expect(r.value).toBe("Build **APIs**");
    expect(r.value.slice(r.start, r.end)).toBe("APIs");
  });

  it("toggles bold off when the selection is already wrapped", () => {
    const r = applyMarkdownAction(sel("Build **APIs**", 8, 12), "bold", "text");
    expect(r.value).toBe("Build APIs");
    expect(r.value.slice(r.start, r.end)).toBe("APIs");
  });

  it("inserts a placeholder when nothing is selected", () => {
    const r = applyMarkdownAction(sel("", 0), "italic", "text");
    expect(r.value).toBe("_text_");
    expect(r.value.slice(r.start, r.end)).toBe("text");
  });

  it("prefixes every selected line with a bullet, and toggles back off", () => {
    const on = applyMarkdownAction(sel("React\nNode", 0, 10), "bulletList", "");
    expect(on.value).toBe("- React\n- Node");
    const off = applyMarkdownAction(
      sel(on.value, 0, on.value.length),
      "bulletList",
      ""
    );
    expect(off.value).toBe("React\nNode");
  });

  it("numbers lines and only touches the lines in the selection", () => {
    const r = applyMarkdownAction(sel("Intro\nA\nB", 6, 9), "numberedList", "");
    expect(r.value).toBe("Intro\n1. A\n2. B");
  });

  it("turns the selection into a link with the URL selected for typing", () => {
    const r = applyMarkdownAction(sel("See docs", 4, 8), "link", "link text");
    expect(r.value).toBe("See [docs](https://)");
    expect(r.value.slice(r.start, r.end)).toBe("https://");
  });
});
