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

// PB64 AC2–4: three 1–5 criteria, strengths, improvements, recommendation.
const fillScorecard = async (
  user: ReturnType<typeof userEvent.setup>,
  recommendation: string
) => {
  await user.click(
    screen.getByRole("radio", { name: "Technical skills: 4/5" })
  );
  await user.click(screen.getByRole("radio", { name: "Communication: 3/5" }));
  await user.click(screen.getByRole("radio", { name: "Culture fit: 5/5" }));
  await user.type(screen.getByLabelText(/^strengths$/i), "System design");
  await user.type(
    screen.getByLabelText(/areas to improve/i),
    "Testing strategy"
  );
  await user.click(screen.getByRole("button", { name: recommendation }));
};

const filledPayload = {
  technicalRating: 4,
  communicationRating: 3,
  cultureFitRating: 5,
  strengths: "System design",
  improvements: "Testing strategy",
};

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

  it("requires every criterion score and both written fields (PB64 AC2–3)", async () => {
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

    await user.click(screen.getByRole("button", { name: "Neutral" }));
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(await screen.findAllByText(/pick a rating/i)).toHaveLength(3);
    expect(screen.getAllByText(/required/i).length).toBeGreaterThanOrEqual(2);
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

    await fillScorecard(user, "Definite hire");
    await user.type(
      screen.getByLabelText(/additional note/i),
      "Sharp on system design."
    );
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      ...filledPayload,
      recommendation: "STRONGLY_RECOMMEND",
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

    await fillScorecard(user, "No hire");
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendation: "NOT_RECOMMEND",
        note: undefined,
      })
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

    await fillScorecard(user, "Hire");
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

    await fillScorecard(user, "Hire");
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

    await fillScorecard(user, "Hire");
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
