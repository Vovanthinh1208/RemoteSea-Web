import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScorecardSection } from "./ScorecardSection";
import {
  useCreateScorecard,
  useScorecards,
} from "@/features/scorecards/scorecard.queries";
import { useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("@/features/scorecards/scorecard.queries");
vi.mock("@/contexts/AuthContext");

const mockedUseScorecards = vi.mocked(useScorecards);
const mockedUseCreateScorecard = vi.mocked(useCreateScorecard);
const mockedUseAuth = vi.mocked(useAuth);

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
};

// ToastProvider always renders its (empty) toast-list container, which would
// break the other tests' toBeEmptyDOMElement() assertions — so it's opt-in,
// only for the test that actually opens ScorecardForm (which needs useToast()).
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
  mockedUseAuth.mockReturnValue({ user: { id: "me" } } as never);
  mockedUseCreateScorecard.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
});

describe("ScorecardSection — loading/error states", () => {
  it("shows a shape-matched loading skeleton while fetching", () => {
    mockedUseScorecards.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as never);

    const { container } = renderWithClient(
      <ScorecardSection
        applicationId="app-1"
        interviewOccurred
        talentName="Jane Doe"
      />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("shows a retry affordance on a failed fetch, not a silent empty state", async () => {
    const refetch = vi.fn();
    mockedUseScorecards.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    } as never);
    const user = userEvent.setup();

    renderWithClient(
      <ScorecardSection
        applicationId="app-1"
        interviewOccurred
        talentName="Jane Doe"
      />
    );

    expect(
      screen.getByText(/couldn't load team feedback/i)
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when there's no feedback yet and the interview hasn't happened", () => {
    mockedUseScorecards.mockReturnValue({
      data: { scorecards: [], summary: { total: 0, hireCount: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    const { container } = renderWithClient(
      <ScorecardSection
        applicationId="app-1"
        interviewOccurred={false}
        talentName="Jane Doe"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe("ScorecardSection — content", () => {
  it("shows the hire-rate summary and each teammate's recommendation", () => {
    mockedUseScorecards.mockReturnValue({
      data: {
        scorecards: [
          {
            id: "sc-1",
            authorId: "other-1",
            author: { name: "Nguyen Van B" },
            recommendation: "STRONG_YES",
            note: "Sharp on system design.",
            createdAt: "2026-08-19T09:00:00.000Z",
          },
          {
            id: "sc-2",
            authorId: "other-2",
            author: { name: "Tran Thi C" },
            recommendation: "NO",
            note: null,
            createdAt: "2026-08-19T10:00:00.000Z",
          },
        ],
        summary: { total: 2, hireCount: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderWithClient(
      <ScorecardSection
        applicationId="app-1"
        interviewOccurred
        talentName="Jane Doe"
      />
    );

    expect(screen.getByText("1/2 recommend hire")).toBeInTheDocument();
    expect(screen.getByText("Nguyen Van B")).toBeInTheDocument();
    expect(screen.getByText("Sharp on system design.")).toBeInTheDocument();
    expect(screen.getByText("Tran Thi C")).toBeInTheDocument();
  });

  it("hides the Add feedback control once the caller already submitted", () => {
    mockedUseScorecards.mockReturnValue({
      data: {
        scorecards: [
          {
            id: "sc-1",
            authorId: "me",
            author: { name: "Me" },
            recommendation: "YES",
            note: null,
            createdAt: "2026-08-19T09:00:00.000Z",
          },
        ],
        summary: { total: 1, hireCount: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderWithClient(
      <ScorecardSection
        applicationId="app-1"
        interviewOccurred
        talentName="Jane Doe"
      />
    );

    expect(
      screen.queryByRole("button", { name: /add feedback/i })
    ).not.toBeInTheDocument();
  });

  it("shows Add feedback once the interview has occurred and the caller hasn't submitted", async () => {
    mockedUseScorecards.mockReturnValue({
      data: { scorecards: [], summary: { total: 0, hireCount: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    const user = userEvent.setup();

    renderWithToast(
      <ScorecardSection
        applicationId="app-1"
        interviewOccurred
        talentName="Jane Doe"
      />
    );

    const addButton = screen.getByRole("button", { name: /add feedback/i });
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);
    expect(screen.getByText(/your read on jane doe/i)).toBeInTheDocument();
  });
});
