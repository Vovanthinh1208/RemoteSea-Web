import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import { PrivacyDataSection } from "./PrivacyDataSection";

const mocks = vi.hoisted(() => ({
  exportDataMutateAsync: vi.fn(),
  exportBlobMutateAsync: vi.fn(),
  updateProfileMutateAsync: vi.fn(),
  exportDataToPdf: vi.fn(),
}));

vi.mock("@/features/users/users.queries", () => ({
  useExportMyData: vi.fn(() => ({
    mutateAsync: mocks.exportDataMutateAsync,
    isPending: false,
  })),
  useExportMyDataBlob: vi.fn(() => ({
    mutateAsync: mocks.exportBlobMutateAsync,
    isPending: false,
  })),
}));

vi.mock("@/features/talent/talent.queries", () => ({
  useMyTalentProfile: vi.fn(() => ({
    data: { visibility: "PUBLIC" },
  })),
  useUpdateMyTalentProfile: vi.fn(() => ({
    mutateAsync: mocks.updateProfileMutateAsync,
    isPending: false,
  })),
}));

vi.mock("@/features/settings/utils/exportPdf", () => ({
  exportDataToPdf: mocks.exportDataToPdf,
  generateExportHtml: vi.fn(() => "<html></html>"),
}));

const renderSection = (locale = "en") =>
  render(
    <I18nProvider initialLocale={locale as "en" | "vi"}>
      <ToastProvider>
        <PrivacyDataSection />
      </ToastProvider>
    </I18nProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.exportBlobMutateAsync.mockResolvedValue(
    new Blob(["%PDF-sample"], { type: "application/pdf" })
  );
  mocks.exportDataMutateAsync.mockResolvedValue({
    exportedAt: "2026-11-10T10:00:00.000Z",
    account: { id: "user_123", email: "test@example.com", name: "Test User" },
  });
});

describe("PrivacyDataSection (PB17 - Export Personal Data)", () => {
  it("renders format selectors (PDF by default) and export button", () => {
    renderSection("en");
    expect(screen.getByRole("button", { name: /^PDF$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^JSON$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /export data/i })
    ).toBeInTheDocument();
  });

  it("exports PDF by default when clicking Export Data", async () => {
    const user = userEvent.setup();
    renderSection("en");

    const exportBtn = screen.getByRole("button", { name: /export data/i });
    await user.click(exportBtn);

    expect(mocks.exportBlobMutateAsync).toHaveBeenCalledWith("pdf");
  });

  it("exports JSON when JSON format is selected", async () => {
    const user = userEvent.setup();
    renderSection("en");

    const jsonToggle = screen.getByRole("button", { name: /^JSON$/i });
    await user.click(jsonToggle);

    const exportBtn = screen.getByRole("button", { name: /export data/i });
    await user.click(exportBtn);

    expect(mocks.exportBlobMutateAsync).toHaveBeenCalledWith("json");
  });

  it("triggers exportDataToPdf when quick print button is clicked", async () => {
    const user = userEvent.setup();
    renderSection("en");

    const printBtn = screen.getByTitle(/export pdf/i);
    await user.click(printBtn);

    expect(mocks.exportDataMutateAsync).toHaveBeenCalled();
    expect(mocks.exportDataToPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        exportedAt: "2026-11-10T10:00:00.000Z",
      }),
      "en"
    );
  });

  it("renders Vietnamese localized labels correctly", () => {
    renderSection("vi");
    expect(
      screen.getByRole("button", { name: /xuất dữ liệu/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tải xuống bản sao thông tin tài khoản/i)
    ).toBeInTheDocument();
  });
});
