import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ListingsPanel } from "./ListingsPanel";
import { useCloseJob } from "@/features/jobs/jobs.queries";
import { useExportJobApplicantsCsv } from "@/features/employer/employer.queries";
import { ToastProvider } from "@/components/ui/toast";
import type { EmployerJobListItem } from "@/types/employer";

vi.mock("@/features/jobs/jobs.queries");
vi.mock("@/features/employer/employer.queries");

const close = vi.fn();

const job = (id: string, status: EmployerJobListItem["status"]) =>
  ({
    id,
    title: `Job ${id}`,
    slug: id,
    status,
    planType: "STANDARD",
    planPaid: true,
    viewCount: 0,
    publishedAt: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    _count: { applications: 0 },
  }) as unknown as EmployerJobListItem;

const renderPanel = (jobs: EmployerJobListItem[]) =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ListingsPanel applicationsByJob={new Map()} jobs={jobs} />
      </ToastProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCloseJob).mockReturnValue({
    mutateAsync: close,
    isPending: false,
  } as never);
  vi.mocked(useExportJobApplicantsCsv).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
});

describe("ListingsPanel actions", () => {
  // PB42: drafts and rejected listings link to the edit page.
  it("offers Edit (and Preview) for a draft, and no Close", () => {
    renderPanel([job("d1", "DRAFT")]);
    expect(screen.getByRole("link", { name: "Edit Job d1" })).toHaveAttribute(
      "href",
      "/employer/jobs/d1/edit"
    );
    expect(
      screen.getByRole("link", { name: "Preview Job d1" })
    ).toHaveAttribute("href", "/jobs/d1");
    expect(screen.queryByRole("button", { name: "Close Job d1" })).toBeNull();
  });

  it("offers Edit for a rejected listing", () => {
    renderPanel([job("r1", "REJECTED")]);
    expect(
      screen.getByRole("link", { name: "Edit Job r1" })
    ).toBeInTheDocument();
  });

  it("offers neither Edit nor Close for a listing in review", () => {
    renderPanel([job("p1", "PENDING_REVIEW")]);
    expect(screen.queryByRole("link", { name: "Edit Job p1" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Close Job p1" })).toBeNull();
  });

  // PB45: closing an ACTIVE listing goes through a confirmation first.
  it("closes an active listing only after confirming", async () => {
    close.mockResolvedValue(undefined);
    renderPanel([job("a1", "ACTIVE")]);
    expect(screen.queryByRole("link", { name: "Edit Job a1" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close Job a1" }));
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Close listing", hidden: true })[0]
    );
    await waitFor(() => expect(close).toHaveBeenCalledWith("a1"));
  });
});
