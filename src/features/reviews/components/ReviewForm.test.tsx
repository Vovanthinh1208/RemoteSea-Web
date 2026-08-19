import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReviewForm } from "./ReviewForm";
import { useCreateReview } from "@/features/reviews/reviews.queries";
import { ApiError } from "@/core/errors/api-error";

vi.mock("@/features/reviews/reviews.queries");

const { toastSpy } = vi.hoisted(() => ({ toastSpy: vi.fn() }));
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

const mockedUseCreateReview = vi.mocked(useCreateReview);

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
};

const clickStars = async (
  user: ReturnType<typeof userEvent.setup>,
  categoryLabel: string,
  stars: number
) => {
  const group = screen.getByText(categoryLabel).closest("div");
  if (!group)
    throw new Error(`Couldn't find rating group for ${categoryLabel}`);
  await user.click(
    within(group).getByRole("button", {
      name: `${stars} star${stars === 1 ? "" : "s"}`,
    })
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ReviewForm — category fields depend on direction", () => {
  it("shows Interview process (not Reliability) for a talent reviewing an employer", () => {
    mockedUseCreateReview.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText("Interview process")).toBeInTheDocument();
    expect(screen.queryByText("Reliability")).not.toBeInTheDocument();
  });

  it("shows Reliability (not Interview process) for an employer reviewing a talent", () => {
    mockedUseCreateReview.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="EMPLOYER_TO_TALENT"
        revieweeName="Jane Doe"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText("Reliability")).toBeInTheDocument();
    expect(screen.queryByText("Interview process")).not.toBeInTheDocument();
  });
});

describe("ReviewForm — submission", () => {
  it("shows a validation message and never submits when no overall rating is picked", async () => {
    const mutateAsync = vi.fn();
    mockedUseCreateReview.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /submit review/i }));

    expect(await screen.findByText(/pick a rating/i)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("submits the picked ratings and comment, then calls onSuccess", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "review-1" });
    mockedUseCreateReview.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    await clickStars(user, "Overall rating", 5);
    await clickStars(user, "Communication", 4);
    await user.type(
      screen.getByLabelText(/comment/i),
      "Great communication throughout."
    );
    await user.click(screen.getByRole("button", { name: /submit review/i }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "app-1",
        overallRating: 5,
        communicationRating: 4,
        comment: "Great communication throughout.",
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("omits an unset comment instead of submitting an empty string", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "review-1" });
    mockedUseCreateReview.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await clickStars(user, "Overall rating", 5);
    await user.click(screen.getByRole("button", { name: /submit review/i }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ comment: undefined })
    );
  });

  it("disables the submit button while the mutation is pending", () => {
    mockedUseCreateReview.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as never);

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /submit review/i })
    ).toBeDisabled();
  });
});

describe("ReviewForm — error state", () => {
  it("shows a specific message when the API reports an already-existing review", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(
        new ApiError(409, { error: "Already reviewed this interaction" })
      );
    mockedUseCreateReview.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await clickStars(user, "Overall rating", 4);
    await user.click(screen.getByRole("button", { name: /submit review/i }));

    await vi.waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        description: "You have already reviewed this interaction.",
      })
    );
  });

  it("shows a specific message when the API reports the interaction isn't eligible", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(
        new ApiError(403, { error: "Not eligible to review this interaction" })
      );
    mockedUseCreateReview.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await clickStars(user, "Overall rating", 4);
    await user.click(screen.getByRole("button", { name: /submit review/i }));

    await vi.waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        description: "You are not eligible to review this interaction.",
      })
    );
  });

  it("falls back to a generic message for an unrecognized error", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("network down"));
    mockedUseCreateReview.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ReviewForm
        applicationId="app-1"
        direction="TALENT_TO_EMPLOYER"
        revieweeName="Acme Inc."
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await clickStars(user, "Overall rating", 4);
    await user.click(screen.getByRole("button", { name: /submit review/i }));

    await vi.waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        title: "Something went wrong. Please try again.",
      })
    );
  });
});
