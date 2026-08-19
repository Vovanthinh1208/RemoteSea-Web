import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { UpcomingInterviewsPage } from "./UpcomingInterviewsPage";
import { useUpcomingInterviews } from "@/features/interviews/interview.queries";

vi.mock("@/features/interviews/interview.queries");

const mockedUseUpcomingInterviews = vi.mocked(useUpcomingInterviews);

const renderPage = () =>
  render(
    <MemoryRouter>
      <UpcomingInterviewsPage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UpcomingInterviewsPage — loading/error/empty states", () => {
  it("shows a shape-matched loading skeleton while fetching", () => {
    mockedUseUpcomingInterviews.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as never);

    const { container } = renderPage();

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("shows a retry affordance on a failed fetch", async () => {
    const refetch = vi.fn();
    mockedUseUpcomingInterviews.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    } as never);
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByText(/couldn't load interviews/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows an empty state when there are no upcoming interviews", () => {
    mockedUseUpcomingInterviews.mockReturnValue({
      data: { scope: "team", interviews: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderPage();

    expect(screen.getByText(/no upcoming interviews/i)).toBeInTheDocument();
  });
});

describe("UpcomingInterviewsPage — content", () => {
  it("titles the page for the team scope and shows every interviewer", () => {
    mockedUseUpcomingInterviews.mockReturnValue({
      data: {
        scope: "team",
        interviews: [
          {
            id: "intv-1",
            applicationId: "app-1",
            confirmedSlot: "2026-08-25T09:00:00.000Z",
            durationMinutes: 30,
            meetingUrl: "https://meet.example.com/x",
            talentName: "Jane Doe",
            jobTitle: "Backend Engineer",
            interviewerId: "user-1",
            interviewerName: "Nguyen Van B",
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderPage();

    expect(screen.getByText(/team interview/i)).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/with Nguyen Van B/)).toBeInTheDocument();
    expect(screen.getByText("Meeting link available")).toBeInTheDocument();
  });

  it("titles the page for the mine scope and omits the interviewer label", () => {
    mockedUseUpcomingInterviews.mockReturnValue({
      data: {
        scope: "mine",
        interviews: [
          {
            id: "intv-1",
            applicationId: "app-1",
            confirmedSlot: "2026-08-25T09:00:00.000Z",
            durationMinutes: 30,
            meetingUrl: null,
            talentName: "Jane Doe",
            jobTitle: "Backend Engineer",
            interviewerId: "user-1",
            interviewerName: "Nguyen Van B",
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderPage();

    expect(screen.getByText(/your upcoming/i)).toBeInTheDocument();
    expect(screen.queryByText(/with Nguyen Van B/)).not.toBeInTheDocument();
  });
});
