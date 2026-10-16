import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { HighlightForm } from "./HighlightForm";

// The profile page wraps these editors in its own <form>; a nested <form> made
// the browser submit natively (page reload, nothing saved).
describe("profile editors are not nested forms", () => {
  it("WorkExperienceForm renders no <form> and 'Add role' calls onSubmit with the values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onCancel = vi.fn();
    const { container } = render(
      <I18nProvider>
        <form>
          <WorkExperienceForm onCancel={onCancel} onSubmit={onSubmit} />
        </form>
      </I18nProvider>
    );
    expect(container.querySelectorAll("form")).toHaveLength(1);

    fireEvent.change(screen.getByLabelText("Company"), {
      target: { value: "Initech" },
    });
    fireEvent.change(screen.getByLabelText("Job title"), {
      target: { value: "Engineer" },
    });
    fireEvent.change(screen.getByLabelText("Start month"), {
      target: { value: "03" },
    });
    fireEvent.change(screen.getByLabelText("Start year"), {
      target: { value: "2020" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add role$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      company: "Initech",
      title: "Engineer",
      startMonth: "2020-03",
      isCurrent: true,
    });
    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it("pressing Enter in a text field submits the experience editor too", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(
      <I18nProvider>
        <WorkExperienceForm onCancel={vi.fn()} onSubmit={onSubmit} />
      </I18nProvider>
    );
    fireEvent.change(screen.getByLabelText("Company"), {
      target: { value: "Initech" },
    });
    fireEvent.change(screen.getByLabelText("Job title"), {
      target: { value: "Engineer" },
    });
    fireEvent.change(screen.getByLabelText("Start month"), {
      target: { value: "03" },
    });
    fireEvent.change(screen.getByLabelText("Start year"), {
      target: { value: "2020" },
    });
    fireEvent.keyDown(screen.getByLabelText("Company"), { key: "Enter" });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("HighlightForm renders no <form> of its own and 'Add' submits", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const { container } = render(
      <I18nProvider>
        <form>
          <HighlightForm
            type="PORTFOLIO"
            onCancel={vi.fn()}
            onSubmit={onSubmit}
          />
        </form>
      </I18nProvider>
    );
    expect(container.querySelectorAll("form")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Project title"), {
      target: { value: "Site" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ title: "Site" });
  });
});
