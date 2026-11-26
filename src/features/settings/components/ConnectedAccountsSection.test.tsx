import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { ConnectedAccountsSection } from "./ConnectedAccountsSection";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mocks = vi.hoisted(() => ({
  connections: [
    {
      id: "acc-1",
      provider: "github",
      providerAccountId: "github-user-123",
      createdAt: "2026-11-18T10:00:00.000Z",
    },
  ] as Array<{
    id: string;
    provider: string;
    providerAccountId: string;
    createdAt: string;
  }>,
  providers: ["google", "github", "linkedin"] as string[],
  disconnectMutateAsync: vi.fn(),
  toastFn: vi.fn(),
}));

vi.mock("@/features/users/users.queries", () => ({
  useMyConnections: () => ({
    data: mocks.connections,
    isLoading: false,
  }),
  useDisconnectMyConnection: () => ({
    mutateAsync: mocks.disconnectMutateAsync,
    isPending: false,
    variables: undefined,
  }),
}));

vi.mock("@/features/auth/auth.queries", () => ({
  useOAuthProviders: () => ({
    data: mocks.providers,
    isPending: false,
    isError: false,
  }),
}));

vi.mock("@/components/ui/toast", async () => {
  const actual = await vi.importActual<typeof import("@/components/ui/toast")>(
    "@/components/ui/toast"
  );
  return {
    ...actual,
    useToast: () => ({ toast: mocks.toastFn }),
  };
});

const renderComponent = (
  initialEntries = ["/settings"],
  locale: "en" | "vi" = "en"
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <I18nProvider initialLocale={locale}>
          <ToastProvider>
            <ConnectedAccountsSection />
          </ToastProvider>
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("ConnectedAccountsSection (PB18)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.disconnectMutateAsync.mockResolvedValue({ success: true });
  });

  it("renders the section header, providers and connection status", () => {
    renderComponent();

    // Section title & eyebrow
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("accounts.")).toBeInTheDocument();

    // Providers
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();

    // GitHub is connected
    expect(screen.getByText("github-user-123")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Disconnect GitHub" })
    ).toBeInTheDocument();

    // Google and LinkedIn are not connected
    expect(
      screen.getByRole("button", { name: "Connect Google" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect LinkedIn" })
    ).toBeInTheDocument();
  });

  it("handles disconnecting an existing provider", async () => {
    const user = userEvent.setup();
    renderComponent();

    const disconnectBtn = screen.getByRole("button", {
      name: "Disconnect GitHub",
    });
    await user.click(disconnectBtn);

    expect(mocks.disconnectMutateAsync).toHaveBeenCalledWith("github");
  });

  it("surfaces error toast in English when connectionError param is present", () => {
    renderComponent(
      ["/settings?connectionError=google&reason=already_linked"],
      "en"
    );

    expect(mocks.toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        title: "Failed to connect account",
        description:
          "That account is already connected to a different RemoteSEA account.",
      })
    );
  });

  it("surfaces error toast in Vietnamese when connectionError param is present", () => {
    renderComponent(
      ["/settings?connectionError=google&reason=already_linked"],
      "vi"
    );

    expect(mocks.toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        title: "Không thể kết nối tài khoản",
        description:
          "Tài khoản đó đã được liên kết với một tài khoản RemoteSEA khác.",
      })
    );
  });

  it("surfaces success toast when connected param is present", () => {
    renderComponent(["/settings?connected=google"], "en");

    expect(mocks.toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        title: "google connected",
      })
    );
  });
});
