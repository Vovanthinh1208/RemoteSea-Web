/// <reference types="node" />
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Blob as NodeBlob } from "node:buffer";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { PrivacyDataSection } from "./PrivacyDataSection";

const mocks = vi.hoisted(() => ({
  exportBlob: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock("@/features/users/users.queries", () => ({
  useExportMyDataBlob: () => ({
    mutateAsync: mocks.exportBlob,
    isPending: false,
  }),
}));
vi.mock("@/features/talent/talent.queries", () => ({
  useMyTalentProfile: () => ({ data: { visibility: "PUBLIC" } }),
  useUpdateMyTalentProfile: () => ({
    mutateAsync: mocks.updateProfile,
    isPending: false,
  }),
}));
const pdf = () =>
  new NodeBlob(["%PDF-1.7\nunit client boundary fixture\n%%EOF"], {
    type: "application/pdf",
  }) as unknown as Blob;
const renderSection = (locale: "en" | "vi" = "en") =>
  render(
    <I18nProvider initialLocale={locale}>
      <ToastProvider>
        <PrivacyDataSection />
      </ToastProvider>
    </I18nProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.exportBlob.mockResolvedValue(pdf());
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:private-unit-test"),
      revokeObjectURL: vi.fn(),
    })
  );
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("PB17 secure Privacy Settings PDF-only download", () => {
  it("TC14 & TC15: displays single primary export button without JSON format options", () => {
    renderSection();
    expect(
      screen.queryByRole("group", { name: /format/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "PDF" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "JSON" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request data export/i })
    ).toBeEnabled();
  });

  it("TC16: calls mutation with format=pdf and locale, then triggers file download", async () => {
    renderSection();
    await userEvent.click(
      screen.getByRole("button", { name: /request data export/i })
    );
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(1));
    expect(mocks.exportBlob).toHaveBeenCalledWith({
      format: "pdf",
      locale: "en",
    });
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it.each([
    ["empty", new NodeBlob([], { type: "application/pdf" })],
    ["HTML error", new NodeBlob(["<html>error</html>"], { type: "text/html" })],
    [
      "truncated PDF",
      new NodeBlob(["%PDF-incomplete"], { type: "application/pdf" }),
    ],
  ])(
    "does not download a %s response or display a success toast",
    async (_name, blob) => {
      mocks.exportBlob.mockResolvedValue(blob);
      renderSection();
      await userEvent.click(
        screen.getByRole("button", { name: /request data export/i })
      );
      await waitFor(() =>
        expect(screen.getByText(/couldn.t export/i)).toBeInTheDocument()
      );
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    }
  );

  it("shows network errors without creating a download", async () => {
    mocks.exportBlob.mockRejectedValue(new Error("Network unavailable"));
    renderSection();
    await userEvent.click(
      screen.getByRole("button", { name: /request data export/i })
    );
    await waitFor(() =>
      expect(screen.getByText(/couldn.t export/i)).toBeInTheDocument()
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("prevents duplicate submission while processing and restores controls afterwards", async () => {
    let finish!: (value: Blob) => void;
    mocks.exportBlob.mockImplementation(
      () =>
        new Promise<Blob>((resolve) => {
          finish = resolve;
        })
    );
    renderSection();
    const user = userEvent.setup();
    await user.dblClick(
      screen.getByRole("button", { name: /request data export/i })
    );
    expect(mocks.exportBlob).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /processing/i })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
    await act(async () => finish(pdf()));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /request data export/i })
      ).toBeEnabled()
    );
  });

  it("uses Vietnamese labels and requests Vietnamese PDF output", async () => {
    renderSection("vi");
    await userEvent.click(
      screen.getByRole("button", { name: /yêu cầu xuất dữ liệu/i })
    );
    expect(mocks.exportBlob).toHaveBeenCalledWith({
      format: "pdf",
      locale: "vi",
    });
    expect(
      screen.getByText(/tải xuống bản sao thông tin tài khoản/i)
    ).toBeInTheDocument();
  });
});
