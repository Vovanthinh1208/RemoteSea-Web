import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VerifyCompanyBanner } from "./VerifyCompanyBanner";
import {
  useSubmitEmployerVerification,
  useVerifyEmployerCode,
} from "@/features/employer/employer.queries";

vi.mock("@/features/employer/employer.queries");

const verify = vi.fn();
const submit = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useVerifyEmployerCode).mockReturnValue({
    mutateAsync: verify,
    isPending: false,
  } as never);
  vi.mocked(useSubmitEmployerVerification).mockReturnValue({
    mutateAsync: submit,
    isPending: false,
  } as never);
});

// PB32 AC4: once a code was sent, the banner asks for it.
describe("VerifyCompanyBanner — OTP step", () => {
  const renderPending = () =>
    render(
      <VerifyCompanyBanner
        verificationEmail="hr@acme.com"
        verificationStatus="PENDING"
      />
    );

  it("submits the 6-digit code", async () => {
    verify.mockResolvedValue({ message: "ok" });
    renderPending();
    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: "482913" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify company/i }));
    await waitFor(() => expect(verify).toHaveBeenCalledWith("482913"));
  });

  it("refuses anything that isn't 6 digits without calling the API", async () => {
    renderPending();
    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: "12ab" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify company/i }));
    expect(await screen.findByText(/6-digit code/i)).toBeInTheDocument();
    expect(verify).not.toHaveBeenCalled();
  });

  it("resends a code to the same address", async () => {
    submit.mockResolvedValue({ message: "sent" });
    renderPending();
    fireEvent.click(screen.getByRole("button", { name: /resend code/i }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith("hr@acme.com"));
  });

  it("can switch back to the email form", () => {
    renderPending();
    fireEvent.click(screen.getByRole("button", { name: /different email/i }));
    expect(screen.getByLabelText(/company email/i)).toBeInTheDocument();
  });
});
