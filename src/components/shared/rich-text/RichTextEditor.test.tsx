import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n";
import { RichTextEditor } from "./RichTextEditor";

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <I18nProvider>
      <RichTextEditor value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </I18nProvider>
  );
}

describe("RichTextEditor (PB41 AC3)", () => {
  it("applies toolbar formatting to the selected text as Markdown", async () => {
    render(<Harness initial="Senior engineer" />);
    const user = userEvent.setup();
    const box = screen.getByRole("textbox") as HTMLTextAreaElement;
    box.setSelectionRange(0, 6);
    await user.click(screen.getByRole("button", { name: /bold|in đậm/i }));
    expect(screen.getByTestId("value")).toHaveTextContent(
      "**Senior** engineer"
    );
  });

  it("previews the formatted result with the same renderer as the job page", async () => {
    render(<Harness initial={"- React\n- Node"} />);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /preview|xem trước/i })
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: /write|soạn thảo/i }));
    expect(screen.getByRole("textbox")).toHaveValue("- React\n- Node");
  });
});
