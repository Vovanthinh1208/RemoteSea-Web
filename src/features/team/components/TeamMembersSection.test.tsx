import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeamMembersSection } from "./TeamMembersSection";
import {
  useRemoveTeamMember,
  useTeamMembers,
  useUpdateTeamMemberRole,
} from "@/features/team/team.queries";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("@/features/team/team.queries");

const mockedUseTeamMembers = vi.mocked(useTeamMembers);
const mockedUseUpdateTeamMemberRole = vi.mocked(useUpdateTeamMemberRole);
const mockedUseRemoveTeamMember = vi.mocked(useRemoveTeamMember);

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
};

const members = [
  {
    id: "member-owner",
    userId: "owner-1",
    role: "OWNER" as const,
    createdAt: "2026-01-01T00:00:00.000Z",
    user: { name: "Owner Person", email: "owner@acme.com" },
  },
  {
    id: "member-recruiter",
    userId: "recruiter-1",
    role: "RECRUITER" as const,
    createdAt: "2026-01-02T00:00:00.000Z",
    user: { name: "Recruiter Person", email: "recruiter@acme.com" },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseUpdateTeamMemberRole.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
  mockedUseRemoveTeamMember.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
});

describe("TeamMembersSection — loading/error/empty states", () => {
  it("shows a shape-matched skeleton while loading", () => {
    mockedUseTeamMembers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as never);

    const { container } = renderWithClient(
      <TeamMembersSection currentUserId="owner-1" />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("shows a retry affordance on a failed fetch", () => {
    mockedUseTeamMembers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as never);

    renderWithClient(<TeamMembersSection currentUserId="owner-1" />);

    expect(screen.getByText(/couldn't load your team/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("shows an empty state when the company has no members", () => {
    mockedUseTeamMembers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderWithClient(<TeamMembersSection currentUserId="owner-1" />);

    expect(screen.getByText(/no team members yet/i)).toBeInTheDocument();
  });
});

describe("TeamMembersSection — role-gated controls", () => {
  it("shows role-change and remove controls to an OWNER, for other members", () => {
    mockedUseTeamMembers.mockReturnValue({
      data: members,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    renderWithClient(<TeamMembersSection currentUserId="owner-1" />);

    // The owner's own row shows a static badge, not a select — you can't
    // change your own role from here.
    expect(screen.getByText("Owner Person")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove owner person/i })
    ).not.toBeInTheDocument();

    // A different member's row gets the role select + remove button. Only
    // one select renders (the owner's own row shows a badge instead), so
    // this also implicitly asserts the owner's row has no select.
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /remove recruiter person/i })
    ).toBeInTheDocument();
  });

  it("hides role-change and remove controls entirely for a non-owner viewer", () => {
    mockedUseTeamMembers.mockReturnValue({
      data: members,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    // Viewing as the RECRUITER, not the OWNER.
    renderWithClient(<TeamMembersSection currentUserId="recruiter-1" />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove/i })
    ).not.toBeInTheDocument();
    // Both members still render, just as read-only role badges.
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Recruiter")).toBeInTheDocument();
  });
});

describe("TeamMembersSection — guarded owner actions (PB39 / PB40)", () => {
  const ownerView = () => {
    mockedUseTeamMembers.mockReturnValue({
      data: members,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    renderWithClient(<TeamMembersSection currentUserId="owner-1" />);
  };

  it("choosing OWNER in the dropdown opens the warning + password step instead of changing the role", () => {
    const mutateAsync = vi.fn();
    mockedUseUpdateTeamMemberRole.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    ownerView();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "OWNER" },
    });

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(
      /lose the highest level of ownership/i
    );
  });

  it("the transfer needs a password, then sends role + password together", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockedUseUpdateTeamMemberRole.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    ownerView();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "OWNER" },
    });

    const confirm = screen.getByText("Transfer ownership", {
      selector: "button",
    }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/your password/i), {
      target: { value: "secret-pw-1" },
    });
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);

    await vi.waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "member-recruiter",
        role: "OWNER",
        password: "secret-pw-1",
      })
    );
  });

  it("a wrong password keeps the dialog open and clears the field for a retry", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(new Error("Current password is incorrect"));
    mockedUseUpdateTeamMemberRole.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    ownerView();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "OWNER" },
    });

    const pw = screen.getByLabelText(/your password/i) as HTMLInputElement;
    fireEvent.change(pw, { target: { value: "wrong-password" } });
    fireEvent.click(
      screen.getByText("Transfer ownership", { selector: "button" })
    );

    await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    await vi.waitFor(() => expect(pw.value).toBe(""));
    expect(document.body.textContent).toMatch(
      /lose the highest level of ownership/i
    );
  });

  it("a non-owner role change applies immediately, without a dialog", () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockedUseUpdateTeamMemberRole.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
    ownerView();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "INTERVIEWER" },
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      id: "member-recruiter",
      role: "INTERVIEWER",
      password: undefined,
    });
  });

  it("the remove (X) button asks for confirmation first and removes only after confirming", async () => {
    const removeAsync = vi.fn().mockResolvedValue(undefined);
    mockedUseRemoveTeamMember.mockReturnValue({
      mutateAsync: removeAsync,
      isPending: false,
    } as never);
    ownerView();

    fireEvent.click(
      screen.getByRole("button", { name: /remove recruiter person/i })
    );
    expect(removeAsync).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByText("Remove from company", { selector: "button" })
    );
    await vi.waitFor(() =>
      expect(removeAsync).toHaveBeenCalledWith("member-recruiter")
    );
  });
});
