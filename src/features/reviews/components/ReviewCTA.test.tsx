import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReviewCTA } from "./ReviewCTA";
import {
  useCreateReview,
  useReviewEligibility,
} from "@/features/reviews/reviews.queries";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("@/features/reviews/reviews.queries");

const mockedUseReviewEligibility = vi.mocked(useReviewEligibility);
const mockedUseCreateReview = vi.mocked(useCreateReview);

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
};

// ToastProvider always renders its (empty) toast-list container, which would
// break the other tests' toBeEmptyDOMElement() assertions — so it's opt-in,
// only for the test that actually opens ReviewForm (which needs useToast()).
const renderWithToast = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseCreateReview.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
});

describe("ReviewCTA — eligibility states", () => {
  it("shows a loading placeholder while eligibility is being fetched", () => {
    mockedUseReviewEligibility.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    const { container } = renderWithClient(
      <ReviewCTA applicationId="app-1" revieweeName="Acme Inc." />
    );

    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders nothing on a failed eligibility fetch — fails closed, not a misleading CTA", () => {
    mockedUseReviewEligibility.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as never);

    const { container } = renderWithClient(
      <ReviewCTA applicationId="app-1" revieweeName="Acme Inc." />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the interaction isn't eligible", () => {
    mockedUseReviewEligibility.mockReturnValue({
      data: {
        eligible: false,
        direction: null,
        revieweeId: null,
        alreadyReviewed: false,
      },
      isLoading: false,
      isError: false,
    } as never);

    const { container } = renderWithClient(
      <ReviewCTA applicationId="app-1" revieweeName="Acme Inc." />
    );

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("button", { name: /write a review/i })
    ).not.toBeInTheDocument();
  });

  it("shows an already-reviewed confirmation instead of a CTA", () => {
    mockedUseReviewEligibility.mockReturnValue({
      data: {
        eligible: false,
        direction: "TALENT_TO_EMPLOYER",
        revieweeId: "emp-1",
        alreadyReviewed: true,
      },
      isLoading: false,
      isError: false,
    } as never);

    renderWithClient(
      <ReviewCTA applicationId="app-1" revieweeName="Acme Inc." />
    );

    expect(
      screen.getByText(/you reviewed this interaction/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /write a review/i })
    ).not.toBeInTheDocument();
  });

  it("shows the Write a review CTA, naming the reviewee, once eligible", () => {
    mockedUseReviewEligibility.mockReturnValue({
      data: {
        eligible: true,
        direction: "TALENT_TO_EMPLOYER",
        revieweeId: "emp-1",
        alreadyReviewed: false,
      },
      isLoading: false,
      isError: false,
    } as never);

    renderWithClient(
      <ReviewCTA applicationId="app-1" revieweeName="Acme Inc." />
    );

    expect(
      screen.getByText(/your interview with acme inc\. is complete/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /write a review/i })
    ).toBeInTheDocument();
  });

  it("opens the review form on click, and returns to the CTA on cancel", async () => {
    const user = userEvent.setup();
    mockedUseReviewEligibility.mockReturnValue({
      data: {
        eligible: true,
        direction: "TALENT_TO_EMPLOYER",
        revieweeId: "emp-1",
        alreadyReviewed: false,
      },
      isLoading: false,
      isError: false,
    } as never);

    renderWithToast(
      <ReviewCTA applicationId="app-1" revieweeName="Acme Inc." />
    );

    await user.click(screen.getByRole("button", { name: /write a review/i }));
    expect(screen.getByText(/review acme inc\./i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(
      screen.getByRole("button", { name: /write a review/i })
    ).toBeInTheDocument();
  });
});
