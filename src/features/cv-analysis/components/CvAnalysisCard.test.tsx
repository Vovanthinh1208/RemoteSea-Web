import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CvAnalysisCard } from "./CvAnalysisCard";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/features/cv-analysis/cv-analysis.service", () => ({
  getCvAnalysis: api.get,
  regenerateCvAnalysis: vi.fn(),
}));

describe("PB66 provider failure feedback", () => {
  it("retains the provider error and allows retry after the request becomes idle", async () => {
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
    fireEvent.click(screen.getByRole("button", { name: /analyze with ai/i }));
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
});
