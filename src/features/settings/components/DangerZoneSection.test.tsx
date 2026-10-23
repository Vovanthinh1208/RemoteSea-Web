import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DangerZoneSection } from "./DangerZoneSection";

const authState = vi.hoisted(() => ({
  user: { role: "TALENT" as string | undefined },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: authState.user }),
}));

vi.mock("@/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/hooks/useToastMutation", () => ({
  useToastMutation: () => async (run: () => Promise<unknown>) => run(),
}));

vi.mock("@/features/users/users.queries", () => ({
  useMyPauseState: () => ({ data: { isPaused: false } }),
  usePauseMyAccount: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useReactivateMyAccount: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/settings/components/DeleteAccountButton", () => ({
  DeleteAccountButton: () => <button>delete-account-action</button>,
}));

vi.mock("@/components/ui/confirm-dialog", () => ({
  ConfirmDialog: () => null,
}));

describe("DangerZoneSection account deletion (PB20)", () => {
  beforeEach(() => {
    authState.user = { role: "TALENT" };
  });

  it.each(["TALENT", "EMPLOYER"])(
    "shows the delete action to %s users",
    (role) => {
      authState.user = { role };
      render(<DangerZoneSection />);
      expect(screen.getByText("delete-account-action")).toBeTruthy();
    }
  );

  it("hides the delete action from ADMIN users", () => {
    authState.user = { role: "ADMIN" };
    render(<DangerZoneSection />);
    expect(screen.queryByText("delete-account-action")).toBeNull();
  });
});
