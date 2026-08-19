import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScorecardForm } from "./ScorecardForm";
import { useCreateScorecard } from "@/features/scorecards/scorecard.queries";
import { ApiError } from "@/core/errors/api-error";

vi.mock("@/features/scorecards/scorecard.queries");

const { toastSpy } = vi.hoisted(() => ({ toastSpy: vi.fn() }));
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

const mockedUseCreateScorecard = vi.mocked(useCreateScorecard);

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ScorecardForm — submission", () => {
  it("shows a validation message and never submits when no recommendation is picked", async () => {
    const mutateAsync = vi.fn();
    mockedUseCreateScorecard.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ScorecardForm
        applicationId="app-1"
        talentName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(
      await screen.findByText(/pick a recommendation/i)
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("submits the picked recommendation and note, then calls onSuccess", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "scorecard-1" });
    mockedUseCreateScorecard.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <ScorecardForm
        applicationId="app-1"
        talentName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole("button", { name: "Strong yes" }));
    await user.type(screen.getByLabelText(/note/i), "Sharp on system design.");
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      recommendation: "STRONG_YES",
      note: "Sharp on system design.",
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("omits an unset note instead of submitting an empty string", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "scorecard-1" });
    mockedUseCreateScorecard.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ScorecardForm
        applicationId="app-1"
        talentName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "No" }));
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ note: undefined })
    );
  });

  it("disables the submit button while the mutation is pending", () => {
    mockedUseCreateScorecard.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as never);

    renderWithClient(
      <ScorecardForm
        applicationId="app-1"
        talentName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /submit feedback/i })
    ).toBeDisabled();
  });
});

describe("ScorecardForm — error state", () => {
  it("shows a specific message when the API reports feedback was already submitted", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(
      new ApiError(409, {
        error: "Already submitted feedback for this interview",
      })
    );
    mockedUseCreateScorecard.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ScorecardForm
        applicationId="app-1"
        talentName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Yes" }));
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await vi.waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        description: "You already submitted feedback for this interview.",
      })
    );
  });

  it("shows a specific message when the API reports the interview isn't eligible yet", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(
      new ApiError(403, {
        error: "Not eligible to submit feedback for this interview yet",
      })
    );
    mockedUseCreateScorecard.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ScorecardForm
        applicationId="app-1"
        talentName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Yes" }));
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await vi.waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        description: "Not eligible to submit feedback for this interview yet.",
      })
    );
  });

  it("falls back to a generic message for an unrecognized error", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("network down"));
    mockedUseCreateScorecard.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ScorecardForm
        applicationId="app-1"
        talentName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Yes" }));
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await vi.waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        title: "Something went wrong. Please try again.",
      })
    );
  });
});
