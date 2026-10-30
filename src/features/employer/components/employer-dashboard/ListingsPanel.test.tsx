import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ListingsPanel } from "./ListingsPanel";
import { useCloseJob, useUpdateJob } from "@/features/jobs/jobs.queries";
import { useExportJobApplicantsCsv } from "@/features/employer/employer.queries";
import { useCreateCheckoutSession } from "@/features/billing/billing.queries";
import { ToastProvider } from "@/components/ui/toast";
import type { EmployerJobListItem } from "@/types/employer";
import type { CompanyMemberRole } from "@/types/team";

vi.mock("@/features/jobs/jobs.queries");
vi.mock("@/features/employer/employer.queries");
vi.mock("@/features/billing/billing.queries");

const close = vi.fn();
const updateJob = vi.fn();
const checkout = vi.fn();

const job = (
  id: string,
  status: EmployerJobListItem["status"],
  planPaid = status !== "DRAFT"
) =>
  ({
    id,
    title: `Job ${id}`,
    slug: id,
    status,
    planType: "STANDARD",
    planPaid,
    viewCount: 0,
    publishedAt: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    _count: { applications: 0 },
  }) as unknown as EmployerJobListItem;

const renderPanel = (
  jobs: EmployerJobListItem[],
  memberRole: CompanyMemberRole | null = "OWNER"
) =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ListingsPanel
          applicationsByJob={new Map()}
          jobs={jobs}
          memberRole={memberRole}
        />
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
  vi.mocked(useUpdateJob).mockReturnValue({
    mutateAsync: updateJob,
    isPending: false,
  } as never);
  vi.mocked(useCreateCheckoutSession).mockReturnValue({
    mutateAsync: checkout,
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

  // PB42/PB45 PRE: only OWNER and RECRUITER edit or close.
  it("hides Edit and Close from hiring managers and interviewers", () => {
    for (const role of ["HIRING_MANAGER", "INTERVIEWER"] as const) {
      const { unmount } = renderPanel(
        [job("d1", "DRAFT"), job("a1", "ACTIVE")],
        role
      );
      expect(screen.queryByRole("link", { name: "Edit Job d1" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Close Job a1" })).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Pay to publish Job d1" })
      ).toBeNull();
      unmount();
    }
  });

  it("hides role-gated actions while the role is still loading", () => {
    renderPanel([job("d1", "DRAFT"), job("a1", "ACTIVE")], null);
    expect(screen.queryByRole("link", { name: "Edit Job d1" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Close Job a1" })).toBeNull();
  });

  // PB43 PRE/RC1: a recruiter edits and closes but doesn't pay.
  it("lets a recruiter edit and close but not pay", () => {
    renderPanel([job("d1", "DRAFT"), job("a1", "ACTIVE")], "RECRUITER");
    expect(
      screen.getByRole("link", { name: "Edit Job d1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close Job a1" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pay to publish Job d1" })
    ).toBeNull();
  });

  it("offers Pay to publish only on an unpaid draft", () => {
    renderPanel([
      job("d1", "DRAFT"),
      job("d2", "DRAFT", true),
      job("r1", "REJECTED"),
      job("a1", "ACTIVE"),
    ]);
    expect(
      screen.getByRole("button", { name: "Pay to publish Job d1" })
    ).toBeInTheDocument();
    for (const id of ["d2", "r1", "a1"]) {
      expect(
        screen.queryByRole("button", { name: `Pay to publish Job ${id}` })
      ).toBeNull();
    }
  });

  // PB43 AC1–3: pick a plan, the choice is saved, then Stripe opens.
  it("saves a changed plan, then redirects to Stripe Checkout", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    updateJob.mockResolvedValue(undefined);
    checkout.mockResolvedValue({ url: "https://checkout.stripe.com/cs_1" });
    renderPanel([job("d1", "DRAFT")]);

    fireEvent.click(
      screen.getByRole("button", { name: "Pay to publish Job d1" })
    );
    fireEvent.click(
      screen.getByRole("radio", { name: /Featured/, hidden: true })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment", hidden: true })
    );

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/cs_1")
    );
    expect(updateJob).toHaveBeenCalledWith({
      id: "d1",
      payload: { planType: "FEATURED" },
    });
    expect(updateJob.mock.invocationCallOrder[0]).toBeLessThan(
      checkout.mock.invocationCallOrder[0]
    );
    vi.unstubAllGlobals();
  });

  it("goes straight to checkout when the plan is unchanged", async () => {
    checkout.mockResolvedValue({ url: null });
    renderPanel([job("d1", "DRAFT")]);
    fireEvent.click(
      screen.getByRole("button", { name: "Pay to publish Job d1" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment", hidden: true })
    );
    await waitFor(() => expect(checkout).toHaveBeenCalledWith("d1"));
    expect(updateJob).not.toHaveBeenCalled();
    // No Stripe on this deployment: says so instead of claiming success.
    expect(
      await screen.findByText(/Online payment isn't available right now/)
    ).toBeInTheDocument();
  });

  it("reports a checkout failure and does not redirect", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    checkout.mockRejectedValue(new Error("boom"));
    renderPanel([job("d1", "DRAFT")]);
    fireEvent.click(
      screen.getByRole("button", { name: "Pay to publish Job d1" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment", hidden: true })
    );
    expect(
      await screen.findByText("Couldn't start checkout.")
    ).toBeInTheDocument();
    expect(assign).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
