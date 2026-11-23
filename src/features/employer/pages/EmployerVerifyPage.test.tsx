import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EmployerVerifyPage } from "./EmployerVerifyPage";
import {
  useConfirmEmployerVerification,
  useVerifyEmployerCode,
} from "@/features/employer/employer.queries";

vi.mock("@/features/employer/employer.queries");

const mockConfirm = vi.fn();
const mockVerifyCode = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useConfirmEmployerVerification).mockReturnValue({
    mutateAsync: mockConfirm,
    isPending: false,
  } as never);
  vi.mocked(useVerifyEmployerCode).mockReturnValue({
    mutateAsync: mockVerifyCode,
    isPending: false,
  } as never);
});

describe("EmployerVerifyPage (DEF-002 / PB32)", () => {
  it("renders the 6-digit OTP code verification form when no token is in URL", () => {
    render(
      <MemoryRouter initialEntries={["/employer/verify"]}>
        <EmployerVerifyPage />
      </MemoryRouter>
    );

    expect(
      screen.getByLabelText(/mã xác nhận|verification code/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /xác minh|verify/i })
    ).toBeInTheDocument();
  });

  it("submits the 6-digit OTP code successfully and displays success screen", async () => {
    mockVerifyCode.mockResolvedValue({ message: "Company email verified" });

    render(
      <MemoryRouter initialEntries={["/employer/verify"]}>
        <EmployerVerifyPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/mã xác nhận|verification code/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /xác minh|verify/i }));

    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith("123456");
    });

    expect(
      await screen.findByRole("heading", {
        name: /đã xác minh công ty|company verified/i,
      })
    ).toBeInTheDocument();
  });

  it("automatically verifies when token query parameter is present", async () => {
    mockConfirm.mockResolvedValue({ message: "Company email verified" });

    render(
      <MemoryRouter initialEntries={["/employer/verify?token=magic-token-xyz"]}>
        <EmployerVerifyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith("magic-token-xyz");
    });

    expect(
      await screen.findByRole("heading", {
        name: /đã xác minh công ty|company verified/i,
      })
    ).toBeInTheDocument();
  });
});
