import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  I18nProvider,
  LOCALE_PENDING_SYNC_KEY,
  LOCALES_STORAGE_KEY,
  useTranslation,
} from "@/i18n";

type MutateOptions = { onSuccess?: () => void; onSettled?: () => void };

const auth = { user: null as null | { id: string } };
const accountQuery = { data: undefined as undefined | { language: string } };
const mutate =
  vi.fn<(vars: { language: string }, opts?: MutateOptions) => void>();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => auth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/features/users/users.queries", () => ({
  useMyAccount: () => accountQuery,
  useUpdateMyAccount: () => ({ mutate }),
}));

const { I18nAccountSync } = await import("@/app/providers");

const Probe = () => {
  const { locale, setLocale, t } = useTranslation();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="label">{t("nav.jobs")}</span>
      <button type="button" onClick={() => setLocale("vi")}>
        pick-vi
      </button>
      <button type="button" onClick={() => setLocale("en")}>
        pick-en
      </button>
    </div>
  );
};

const renderSync = () =>
  render(
    <I18nProvider>
      <I18nAccountSync />
      <Probe />
    </I18nProvider>
  );

const locale = () => screen.getByTestId("locale").textContent;
const pending = () => localStorage.getItem(LOCALE_PENDING_SYNC_KEY);

describe("I18nAccountSync", () => {
  beforeEach(() => {
    auth.user = { id: "u1" };
    accountQuery.data = { language: "English" };
    mutate.mockReset();
  });
  afterEach(() => localStorage.clear());

  it("pushes a choice made before sign-in to the account instead of losing it", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "vi");
    localStorage.setItem(LOCALE_PENDING_SYNC_KEY, "1");
    renderSync();

    expect(locale()).toBe("vi");
    expect(screen.getByTestId("label").textContent).toBe("Việc làm");
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({ language: "Tiếng Việt" });

    act(() => mutate.mock.calls[0][1]?.onSuccess?.());
    expect(pending()).toBeNull();
  });

  it("keeps the choice pending when saving it to the account fails", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "vi");
    localStorage.setItem(LOCALE_PENDING_SYNC_KEY, "1");
    renderSync();

    act(() => mutate.mock.calls[0][1]?.onSettled?.());
    expect(locale()).toBe("vi");
    expect(pending()).toBe("1");
  });

  it("applies the account language when no newer choice is pending", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "en");
    accountQuery.data = { language: "Tiếng Việt" };
    renderSync();

    expect(locale()).toBe("vi");
    expect(mutate).not.toHaveBeenCalled();
    expect(localStorage.getItem(LOCALES_STORAGE_KEY)).toBe("vi");
    expect(pending()).toBeNull();
  });

  it("clears the pending flag without a request when the account already agrees", () => {
    localStorage.setItem(LOCALES_STORAGE_KEY, "vi");
    localStorage.setItem(LOCALE_PENDING_SYNC_KEY, "1");
    accountQuery.data = { language: "Tiếng Việt" };
    renderSync();

    expect(mutate).not.toHaveBeenCalled();
    expect(pending()).toBeNull();
  });

  it("saves a switch made while signed in, and does not clear a newer switch", async () => {
    const user = userEvent.setup();
    renderSync();
    expect(locale()).toBe("en");

    await user.click(screen.getByText("pick-vi"));
    expect(mutate).toHaveBeenLastCalledWith(
      { language: "Tiếng Việt" },
      expect.any(Object)
    );
    const firstSave = mutate.mock.calls.at(-1)?.[1];

    await user.click(screen.getByText("pick-en"));
    act(() => firstSave?.onSuccess?.());
    // The vi save finished after the user moved on to en: en stays pending.
    expect(pending()).toBe("1");
    expect(locale()).toBe("en");
  });

  it("an older save landing late never overrides the newest choice", async () => {
    const user = userEvent.setup();
    const view = renderSync();

    await user.click(screen.getByText("pick-vi"));
    const viSave = mutate.mock.calls.at(-1)?.[1];
    await user.click(screen.getByText("pick-en"));
    // en matches the (not yet updated) account, but the vi save is in flight.
    expect(pending()).toBe("1");

    // The vi save completes and the account now says vi.
    act(() => {
      viSave?.onSuccess?.();
      viSave?.onSettled?.();
    });
    accountQuery.data = { language: "Tiếng Việt" };
    view.rerender(
      <I18nProvider>
        <I18nAccountSync />
        <Probe />
      </I18nProvider>
    );

    expect(locale()).toBe("en");
    expect(mutate).toHaveBeenLastCalledWith(
      { language: "English" },
      expect.any(Object)
    );
  });

  it("does nothing for signed-out visitors", () => {
    auth.user = null;
    accountQuery.data = undefined;
    localStorage.setItem(LOCALES_STORAGE_KEY, "vi");
    localStorage.setItem(LOCALE_PENDING_SYNC_KEY, "1");
    renderSync();

    expect(locale()).toBe("vi");
    expect(mutate).not.toHaveBeenCalled();
  });
});
