// Explicit backlog acceptance probes, run with vitest.sprint3.config.ts.
import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchCard } from "@/features/jobs/pages/job-detail/MatchCard";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";

vi.mock("@/features/reviews/reviews.queries", () => ({
  useUserReviews: () => ({
    data: {
      averageRating: 3,
      totalReviews: 2,
      ratings: {},
      reviews: [
        {
          id: "r-1",
          overallRating: 4,
          comment: "Professional experience.",
          createdAt: "2026-10-16T08:00:00Z",
          reviewer: { name: "Candidate", employer: null },
        },
        {
          id: "r-2",
          overallRating: 2,
          comment: "Earlier experience.",
          createdAt: "2026-10-15T08:00:00Z",
          reviewer: { name: "Earlier candidate", employer: null },
        },
      ],
      pagination: { page: 1, pages: 1, total: 2 },
    },
    isLoading: false,
    isError: false,
  }),
}));
it("S3-PB50-UI01 match percentage exposes the documented progress indicator [AC3]", () => {
  render(
    <MatchCard
      match={{
        score: 85,
        reasons: [],
        missingSkills: [{ id: "redis", name: "Redis", isRequired: true }],
      }}
    />
  );
  expect(screen.getByText("85%")).toBeInTheDocument();
  expect(screen.getByText("Redis")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "85"
  );
});
it("S3-PB72-UI01 public reviews display the server's publication order [AC3]", () => {
  render(<ReviewsSection userId="employer-1" categories={[]} />);
  expect(screen.getByText(/professional experience/i)).toBeInTheDocument();
  const reviews = screen.getAllByText(/experience\./i);
  expect(reviews[0]).toHaveTextContent("Professional experience.");
  expect(reviews[1]).toHaveTextContent("Earlier experience.");
});
