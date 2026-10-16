import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ApiError } from "@/core/errors/api-error";
import { ApplyButton } from "./ApplyButton";

const mocks = vi.hoisted(() => ({
  apply: vi.fn(),
  toast: vi.fn(),
  appliedIds: [] as string[],
  pending: false,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "talent-1", role: "TALENT" } }),
}));
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: mocks.toast }),
}));
vi.mock("@/features/applications/applications.queries", () => ({
  useApplyToJob: () => ({ mutateAsync: mocks.apply, isPending: mocks.pending }),
  useMyApplicationIds: () => ({ data: mocks.appliedIds }),
}));
vi.mock("@/features/talent/talent.queries", () => ({
  useMyTalentProfile: () => ({
    data: { resumeUrl: "https://fixtures.invalid/resume.pdf" },
  }),
}));
vi.mock("@/components/ui/file-upload", () => ({
  FileUpload: () => <div>Resume upload</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.appliedIds = [];
  mocks.pending = false;
});
function open() {
  render(
    <MemoryRouter>
      <ApplyButton jobId="job-1" />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole("button", { name: /apply now/i }));
}
describe("PB53 application submission feedback", () => {
  it("S3-PB53-UI01 uses profile CV, trims cover letter and displays success only after persistence", async () => {
    mocks.apply.mockResolvedValue({ id: "application-1" });
    open();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  Relevant experience  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /send application/i }));
    await waitFor(() =>
      expect(mocks.apply).toHaveBeenCalledWith({
        jobId: "job-1",
        resumeUrl: "https://fixtures.invalid/resume.pdf",
        coverLetter: "Relevant experience",
      })
    );
    await waitFor(() =>
      expect(screen.getByText(/application sent/i)).toBeInTheDocument()
    );
  });
  it("S3-PB53-UI02 inactive-job conflict must not claim an application was submitted", async () => {
    mocks.apply.mockRejectedValue(
      new ApiError(409, {
        error: "This job is no longer accepting applications",
        code: "JOB_NOT_ACTIVE",
      })
    );
    open();
    fireEvent.click(screen.getByRole("button", { name: /send application/i }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
    expect(screen.queryByText(/application sent/i)).not.toBeInTheDocument();
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "error" })
    );
  });
  it("S3-PB53-UI03 duplicate application conflict displays the persisted applied state", async () => {
    mocks.apply.mockRejectedValue(
      new ApiError(409, { error: "Already applied", code: "ALREADY_APPLIED" })
    );
    open();
    fireEvent.click(screen.getByRole("button", { name: /send application/i }));
    await waitFor(() =>
      expect(screen.getByText(/application sent/i)).toBeInTheDocument()
    );
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "info" })
    );
  });
  it("S3-PB53-UI04 pending submission disables the submit control", () => {
    mocks.pending = true;
    open();
    expect(
      screen.getByRole("button", { name: /send application/i })
    ).toBeDisabled();
  });
  it("S3-PB53-UI05 reloading persisted applied membership avoids a second submission", () => {
    mocks.appliedIds = ["job-1"];
    render(
      <MemoryRouter>
        <ApplyButton jobId="job-1" />
      </MemoryRouter>
    );
    expect(screen.getByText(/application sent/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply now/i })
    ).not.toBeInTheDocument();
    expect(mocks.apply).not.toHaveBeenCalled();
  });
});
