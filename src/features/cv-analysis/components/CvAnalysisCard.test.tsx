import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CvAnalysisCard } from "./CvAnalysisCard";

const api = vi.hoisted(() => ({ get: vi.fn(), cached: vi.fn() }));
vi.mock("@/features/cv-analysis/cv-analysis.service", () => ({
  getCvAnalysis: api.get,
  getCachedCvAnalysis: api.cached,
  regenerateCvAnalysis: vi.fn(),
}));

describe("PB66 provider failure feedback", () => {
  it("retains the provider error and allows retry after the request becomes idle", async () => {
    api.get.mockReset();
    api.cached.mockResolvedValue(null);
    api.get.mockRejectedValue(new Error("Provider unavailable"));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <CvAnalysisCard applicationId="app-1" talentName="Test candidate" />
      </QueryClientProvider>
    );
    expect(api.get).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("button", { name: /analyze with ai/i })
    );
    expect(
      await screen.findByText("Couldn't analyze this CV.")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(
      await screen.findByText("Couldn't analyze this CV.")
    ).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(2);
    queryClient.clear();
  });

  it("loads a persisted analysis after remount without generating it again", async () => {
    api.get.mockReset();
    api.cached.mockResolvedValue({
      id: "analysis-1",
      applicationId: "app-persisted",
      fitScore: 82,
      summary: "Persisted analysis from the database",
      strengths: ["React"],
      gaps: [],
      suggestedQuestions: [],
      recommendation: "PROCEED",
      recommendationReason: "Relevant skills",
      model: "test",
      createdAt: new Date().toISOString(),
    });
    const first = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={first}>
        <CvAnalysisCard applicationId="app-persisted" talentName="Candidate" />
      </QueryClientProvider>
    );
    expect(
      await screen.findByText("Persisted analysis from the database")
    ).toBeInTheDocument();
    view.unmount();
    first.clear();
    const second = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={second}>
        <CvAnalysisCard applicationId="app-persisted" talentName="Candidate" />
      </QueryClientProvider>
    );
    await waitFor(() =>
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "82"
      )
    );
    expect(api.get).not.toHaveBeenCalled();
    second.clear();
  });
});
