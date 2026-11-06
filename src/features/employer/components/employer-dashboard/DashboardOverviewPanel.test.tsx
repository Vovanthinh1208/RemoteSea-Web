import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardOverviewPanel } from "./DashboardOverviewPanel";
import type { EmployerDashboardOverview } from "@/types/employer";

const overview = (
  extra: Partial<EmployerDashboardOverview> = {}
): EmployerDashboardOverview => ({
  jobCounts: { ACTIVE: 4, PENDING_REVIEW: 3, DRAFT: 2, CLOSED: 7 },
  unseenApplications: 9,
  upcomingInterviews: { scope: "team", interviews: [] },
  stats: null,
  ...extra,
});

const renderPanel = (o: EmployerDashboardOverview) =>
  render(
    <MemoryRouter>
      <DashboardOverviewPanel overview={o} />
    </MemoryRouter>
  );

describe("DashboardOverviewPanel (PB34 AC2)", () => {
  it("shows each status count and the unseen applications", () => {
    renderPanel(overview());
    for (const n of ["4", "3", "2", "7", "9"]) {
      expect(screen.getByText(n)).toBeInTheDocument();
    }
  });

  it("says so when no interview is coming up", () => {
    renderPanel(overview());
    expect(screen.getByText(/next 7 days\./i)).toBeInTheDocument();
  });

  it("lists an upcoming interview with the candidate and the job", () => {
    renderPanel(
      overview({
        upcomingInterviews: {
          scope: "team",
          interviews: [
            {
              id: "i1",
              title: null,
              applicationId: "a1",
              confirmedSlot: "2030-01-02T03:00:00.000Z",
              durationMinutes: 30,
              meetingUrl: null,
              talentName: "An Nguyen",
              jobTitle: "Backend Engineer",
              interviewerId: null,
              interviewerName: null,
            },
          ],
        },
      })
    );
    expect(
      screen.getByText("An Nguyen · Backend Engineer")
    ).toBeInTheDocument();
  });
});
