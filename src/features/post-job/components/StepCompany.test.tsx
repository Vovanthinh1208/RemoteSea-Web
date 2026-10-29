import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n";
import { INITIAL_FORM_STATE } from "@/features/post-job/post-job.schemas";
import { StepCompany } from "./StepCompany";

const renderStep = (companyExists: boolean) =>
  render(
    <I18nProvider>
      <StepCompany
        companyExists={companyExists}
        form={INITIAL_FORM_STATE}
        set={vi.fn()}
      />
    </I18nProvider>
  );

describe("StepCompany logo upload (PB30 AC3)", () => {
  it("offers a PNG/JPG logo upload when the company is being created", () => {
    const { container } = renderStep(false);
    expect(
      screen.getByText(/company logo \(png\/jpg|logo công ty \(png\/jpg/i)
    ).toBeInTheDocument();
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("accept", "image/png,image/jpeg");
  });

  it("leaves the logo to Company settings when the company already exists", () => {
    const { container } = renderStep(true);
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });
});
