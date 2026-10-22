import { describe, expect, it } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { I18nProvider, useI18n } from "@/i18n";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import { m } from "@/i18n/zod";

const schema = z.object({
  email: z.string().min(1, m("validation.emailRequired")),
  note: z.string(),
});

const Harness = () => {
  const { setLocale } = useI18n();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", note: "" },
  });
  useRevalidateOnLocaleChange(form);
  return (
    <form onSubmit={form.handleSubmit(() => {})}>
      <input aria-label="note" {...form.register("note")} />
      <input aria-label="email" {...form.register("email")} />
      <p data-testid="err">{form.formState.errors.email?.message}</p>
      <p data-testid="note-err">{form.formState.errors.note?.message}</p>
      <button type="submit">go</button>
      <button
        type="button"
        onClick={() =>
          form.setError("note", { type: "server", message: "Taken on server" })
        }
      >
        server-error
      </button>
      <button type="button" onClick={() => setLocale("vi")}>
        vi
      </button>
    </form>
  );
};

describe("useRevalidateOnLocaleChange", () => {
  it("re-translates visible errors without losing typed values", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    render(
      <I18nProvider initialLocale="en">
        <Harness />
      </I18nProvider>
    );
    await user.type(screen.getByLabelText("note"), "keep me");
    await user.click(screen.getByText("go"));
    expect(await screen.findByText("Email is required")).toBeTruthy();

    await act(async () => {
      await user.click(screen.getByText("vi"));
    });
    expect(await screen.findByText("Vui lòng nhập email")).toBeTruthy();
    expect((screen.getByLabelText("note") as HTMLInputElement).value).toBe(
      "keep me"
    );
  });

  it("keeps errors that came from the server instead of clearing them", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    render(
      <I18nProvider initialLocale="en">
        <Harness />
      </I18nProvider>
    );
    await user.type(screen.getByLabelText("email"), "a@b.co");
    await user.click(screen.getByText("server-error"));
    expect(screen.getByTestId("note-err").textContent).toBe("Taken on server");

    await act(async () => {
      await user.click(screen.getByText("vi"));
    });
    expect(screen.getByTestId("note-err").textContent).toBe("Taken on server");
  });
});
