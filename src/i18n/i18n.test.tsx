import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  I18nProvider,
  useTranslation,
  LOCALES_STORAGE_KEY,
  LOCALE_PENDING_SYNC_KEY,
} from "@/i18n";
import {
  formatDate,
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  formatDurationLocale,
} from "@/i18n/formatters";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    status: "unauthenticated",
  })),
}));

vi.mock("@/features/users/users.queries", () => ({
  useUpdateMyAccount: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({}),
  })),
  useMyAccount: vi.fn(() => ({
    data: null,
  })),
}));

const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialLocale,
    accountLanguage,
  }: {
    initialLocale?: "en" | "vi";
    accountLanguage?: string | null;
  } = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider
        accountLanguage={accountLanguage}
        initialLocale={initialLocale}
      >
        {ui}
      </I18nProvider>
    </QueryClientProvider>
  );
};

describe("I18n System", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  afterEach(() => {
    localStorage.clear();
  });

  const TestConsumer = () => {
    const { locale, setLocale, setLocaleFromAccount, t } = useTranslation();
    return (
      <div>
        <span data-testid="current-locale">{locale}</span>
        <span data-testid="translated-jobs">{t("nav.jobs")}</span>
        <span data-testid="interpolated-welcome">
          {t("talent.dashboard.welcome", { name: "Thanh" })}
        </span>
        <button
          data-testid="switch-to-vi"
          type="button"
          onClick={() => setLocale("vi")}
        >
          Switch to VI
        </button>
        <button
          data-testid="switch-to-en"
          type="button"
          onClick={() => setLocale("en")}
        >
          Switch to EN
        </button>
        <button
          data-testid="server-set-to-vi"
          type="button"
          onClick={() => setLocaleFromAccount("vi")}
        >
          Server preference: VI
        </button>
        <button
          data-testid="server-set-to-en"
          type="button"
          onClick={() => setLocaleFromAccount("en")}
        >
          Server preference: EN
        </button>
      </div>
    );
  };

  it("defaults to English when no storage or account pref exists", () => {
    renderWithProviders(<TestConsumer />);
    expect(screen.getByTestId("current-locale").textContent).toBe("en");
    expect(screen.getByTestId("translated-jobs").textContent).toBe("Jobs");
    expect(document.documentElement.lang).toBe("en");
  });

  it("switches language dynamically without page reload", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestConsumer />);

    expect(screen.getByTestId("translated-jobs").textContent).toBe("Jobs");

    await user.click(screen.getByTestId("switch-to-vi"));

    expect(screen.getByTestId("current-locale").textContent).toBe("vi");
    expect(screen.getByTestId("translated-jobs").textContent).toBe("Việc làm");
    expect(document.documentElement.lang).toBe("vi");
    expect(localStorage.getItem(LOCALES_STORAGE_KEY)).toBe("vi");

    await user.click(screen.getByTestId("switch-to-en"));

    expect(screen.getByTestId("current-locale").textContent).toBe("en");
    expect(screen.getByTestId("translated-jobs").textContent).toBe("Jobs");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(LOCALES_STORAGE_KEY)).toBe("en");
  });

  it("supports parameter interpolation", () => {
    renderWithProviders(<TestConsumer />, { initialLocale: "vi" });
    expect(screen.getByTestId("interpolated-welcome").textContent).toBe(
      "Chào mừng trở lại, Thanh"
    );
  });

  it("initializes from localStorage if stored", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "vi");
    renderWithProviders(<TestConsumer />);
    expect(screen.getByTestId("current-locale").textContent).toBe("vi");
    expect(screen.getByTestId("translated-jobs").textContent).toBe("Việc làm");
  });

  it("prefers the validated account language over localStorage", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "en");
    renderWithProviders(<TestConsumer />, { accountLanguage: "Tiếng Việt" });
    expect(screen.getByTestId("current-locale").textContent).toBe("vi");
  });

  it("keeps a choice not yet saved to the account over the account language", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "vi");
    localStorage.setItem(LOCALE_PENDING_SYNC_KEY, "1");
    renderWithProviders(<TestConsumer />, { accountLanguage: "English" });
    expect(screen.getByTestId("current-locale").textContent).toBe("vi");
  });

  it("ignores unsupported locale values and falls back to English", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "fr");
    renderWithProviders(<TestConsumer />, { accountLanguage: "fr" });
    expect(screen.getByTestId("current-locale").textContent).toBe("en");
  });

  it("accepts a valid locale change from another tab", async () => {
    renderWithProviders(<TestConsumer />);
    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LOCALES_STORAGE_KEY,
          oldValue: null,
          newValue: "vi",
        })
      );
    });
    expect(screen.getByTestId("current-locale").textContent).toBe("vi");
    expect(screen.getByTestId("translated-jobs").textContent).toBe("Việc làm");
  });

  it("lets a server preference override storage until a session choice is made", async () => {
    const user = userEvent.setup();
    localStorage.setItem(LOCALES_STORAGE_KEY, "en");
    renderWithProviders(<TestConsumer />);

    await user.click(screen.getByTestId("server-set-to-vi"));
    expect(screen.getByTestId("current-locale").textContent).toBe("vi");

    await user.click(screen.getByTestId("switch-to-en"));
    await user.click(screen.getByTestId("server-set-to-vi"));
    expect(screen.getByTestId("current-locale").textContent).toBe("en");
  });

  it("initializes from account language if no local override exists", () => {
    renderWithProviders(<TestConsumer />, {
      accountLanguage: "Tiếng Việt",
    });
    expect(screen.getByTestId("current-locale").textContent).toBe("vi");
    expect(screen.getByTestId("translated-jobs").textContent).toBe("Việc làm");
  });

  it("falls back to English when a key is not translated in Vietnamese", () => {
    const FallbackConsumer = () => {
      const { t } = useTranslation();
      return (
        <span data-testid="fallback-result">{t("nonexistent.key.sample")}</span>
      );
    };

    renderWithProviders(<FallbackConsumer />, { initialLocale: "vi" });
    expect(screen.getByTestId("fallback-result").textContent).toBe(
      "nonexistent.key.sample"
    );
  });
});

describe("Formatters", () => {
  it("formats dates with locale-awareness", () => {
    const date = new Date("2026-08-15T00:00:00Z");
    const en = formatDate(
      date,
      { month: "short", year: "numeric", timeZone: "UTC" },
      "en"
    );
    const vi = formatDate(
      date,
      { month: "short", year: "numeric", timeZone: "UTC" },
      "vi"
    );

    expect(en).toContain("2026");
    expect(vi).toContain("2026");
  });

  it("formats numbers and currency", () => {
    expect(formatNumber(12500, undefined, "en")).toBe("12,500");
    expect(formatCurrency(1000, "USD", "en")).toContain("$1,000");
    expect(formatCurrency(50000000, "VND", "vi")).toContain("50.000.000");
  });

  it("formats relative time correctly", () => {
    const recent = new Date(Date.now() - 30 * 1000);
    expect(formatRelativeTime(recent, "en")).toBe("Just now");
    expect(formatRelativeTime(recent, "vi")).toBe("Vừa xong");

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo, "en")).toBe("2d ago");
    expect(formatRelativeTime(twoDaysAgo, "vi")).toBe("2 ngày trước");
  });

  it("formats duration correctly in both languages", () => {
    const start = "2024-01-01T00:00:00Z";
    const end = "2026-04-01T00:00:00Z";
    expect(formatDurationLocale(start, end, "en")).toBe("2 yrs 3 mo");
    expect(formatDurationLocale(start, end, "vi")).toBe("2 năm 3 tháng");
  });
});

describe("LanguageSwitcher Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders desktop variant and opens popover on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher variant="desktop" />);

    const button = screen.getByRole("button", {
      name: /select display language/i,
    });
    expect(button).toBeDefined();

    await user.click(button);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeDefined();
    expect(screen.getByRole("option", { name: /english/i })).toBeDefined();
    expect(screen.getByRole("option", { name: /tiếng việt/i })).toBeDefined();

    // Select Tiếng Việt
    await user.click(screen.getByRole("option", { name: /tiếng việt/i }));
    expect(localStorage.getItem(LOCALES_STORAGE_KEY)).toBe("vi");
  });

  it("renders mobile variant with interactive buttons", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher variant="mobile" />);

    expect(screen.getByText(/language/i)).toBeDefined();
    const viBtn = screen.getByRole("button", { name: /tiếng việt/i });
    await user.click(viBtn);

    expect(localStorage.getItem(LOCALES_STORAGE_KEY)).toBe("vi");
  });
});
