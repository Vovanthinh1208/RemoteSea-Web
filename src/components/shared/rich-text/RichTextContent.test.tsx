import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RichTextContent } from "./RichTextContent";

describe("RichTextContent", () => {
  it("renders Markdown formatting (bold, lists, links)", () => {
    render(
      <RichTextContent
        text={
          "**Remote** role\n\n- React\n- Node\n\n[Docs](https://example.com)"
        }
      />
    );
    expect(screen.getByText("Remote").tagName).toBe("STRONG");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("keeps raw HTML inert: a stored <script> is never turned into a DOM element", () => {
    const { container } = render(
      <RichTextContent
        text={'<script>alert(1)</script><img src=x onerror="alert(2)"> text'}
      />
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("drops javascript: link targets", () => {
    render(<RichTextContent text="[click](javascript:alert(1))" />);
    const link = screen.getByText("click").closest("a");
    expect(link?.getAttribute("href") ?? "").not.toMatch(/^javascript:/i);
  });

  it("keeps single newlines of legacy plain-text descriptions as line breaks", () => {
    const { container } = render(
      <RichTextContent text={"Line one\nLine two"} />
    );
    expect(container.querySelector("br")).not.toBeNull();
  });
});
