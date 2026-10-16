import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider, useTranslation } from "@/i18n";

const Probe = () => {
  const { locale, setLocale, t } = useTranslation();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="label">{t("nav.jobs")}</span>
      <button type="button" onClick={() => setLocale("vi")}>
        vi
      </button>
      <button type="button" onClick={() => setLocale("en")}>
        en
      </button>
    </div>
  );
};

describe("i18n edge cases", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("still switches language when localStorage throws", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    );
    expect(screen.getByTestId("locale").textContent).toBe("en");
    await user.click(screen.getByText("vi"));
    expect(screen.getByTestId("locale").textContent).toBe("vi");
    expect(screen.getByTestId("label").textContent).toBe("Việc làm");
  });

  it("ends in the last selected locale after rapid switching", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    );
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText("vi"));
        await user.click(screen.getByText("en"));
      }
      await user.click(screen.getByText("vi"));
    });
    expect(screen.getByTestId("locale").textContent).toBe("vi");
    expect(localStorage.getItem("remotesea_locale")).toBe("vi");
    expect(document.documentElement.lang).toBe("vi");
  });

  it("pluralizes English but not Vietnamese", () => {
    const Plural = () => {
      const { t } = useTranslation();
      return (
        <span data-testid="p">
          {t("salary.country.listings", { count: 1 })}
        </span>
      );
    };
    const { unmount } = render(
      <I18nProvider initialLocale="en">
        <Plural />
      </I18nProvider>
    );
    expect(screen.getByTestId("p").textContent).toBe("1 open listing");
    unmount();
    render(
      <I18nProvider initialLocale="vi">
        <Plural />
      </I18nProvider>
    );
    expect(screen.getByTestId("p").textContent).toBe("1 tin đang mở");
  });
});
