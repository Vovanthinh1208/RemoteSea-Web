import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nContext";
import { ToastProvider } from "@/components/ui/toast";
import {
  CompanyDocumentsPanel,
  OwnerCompanyDocuments,
} from "./CompanyDocumentsPanel";
import * as service from "./company-documents.service";
const mocks = vi.hoisted(() => ({ role: "OWNER" }));
vi.mock("@/features/team/team.queries", () => ({
  useMyCompanyRole: () => mocks.role,
}));
vi.mock("./company-documents.service", () => ({
  listCompanyDocuments: vi.fn(),
  uploadCompanyDocument: vi.fn(),
  downloadCompanyDocument: vi.fn(),
}));
afterEach(() => {
  vi.resetAllMocks();
  mocks.role = "OWNER";
});
const show = (ui: React.ReactNode) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>{ui}</ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};
it("shows a read-only administrator list with a real download action and no upload control", async () => {
  vi.mocked(service.listCompanyDocuments).mockResolvedValue([
    {
      id: "d",
      filename: "company.pdf",
      byteLength: 1024,
      createdAt: new Date().toISOString(),
    },
  ]);
  vi.mocked(service.downloadCompanyDocument).mockResolvedValue();
  show(<CompanyDocumentsPanel employerId="company" />);
  await screen.findByText(/company.pdf/);
  expect(
    screen.queryByLabelText("Attach a PDF for administrator review")
  ).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Download PDF" }));
  await waitFor(() =>
    expect(service.downloadCompanyDocument).toHaveBeenCalledOnce()
  );
  expect(service.listCompanyDocuments).toHaveBeenCalledWith("company");
});
it("hides private company documents from a recruiter", () => {
  mocks.role = "RECRUITER";
  show(<OwnerCompanyDocuments />);
  expect(
    screen.queryByRole("heading", { name: "Company verification documents" })
  ).not.toBeInTheDocument();
  expect(service.listCompanyDocuments).not.toHaveBeenCalled();
});
it("uploads a selected PDF once and reports the actual outcome", async () => {
  vi.mocked(service.listCompanyDocuments).mockResolvedValue([]);
  vi.mocked(service.uploadCompanyDocument).mockResolvedValue({
    id: "d",
    filename: "company.pdf",
    byteLength: 20,
    createdAt: new Date().toISOString(),
  });
  show(<CompanyDocumentsPanel canUpload />);
  await screen.findByText("No verification documents have been attached.");
  const file = new File(["%PDF-1.7\n%%EOF"], "company.pdf", {
    type: "application/pdf",
  });
  await userEvent.upload(
    screen.getByLabelText("Attach a PDF for administrator review"),
    file
  );
  await userEvent.dblClick(
    screen.getByRole("button", { name: "Attach document" })
  );
  await waitFor(() =>
    expect(service.uploadCompanyDocument).toHaveBeenCalledTimes(1)
  );
  await screen.findByText("Verification document attached");
  expect(
    screen.getByRole("button", { name: "Attach document" })
  ).toBeDisabled();
});
it("preserves retryable input and shows failure when the upload fails", async () => {
  vi.mocked(service.listCompanyDocuments).mockResolvedValue([]);
  vi.mocked(service.uploadCompanyDocument).mockRejectedValue(
    new Error("Network error")
  );
  show(<CompanyDocumentsPanel canUpload />);
  const file = new File(["pdf"], "company.pdf", { type: "application/pdf" });
  await userEvent.upload(
    screen.getByLabelText("Attach a PDF for administrator review"),
    file
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Attach document" })
  );
  await screen.findByText("Could not attach document");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Attach document" })
    ).toBeEnabled()
  );
  expect(
    screen.queryByText("Verification document attached")
  ).not.toBeInTheDocument();
});
