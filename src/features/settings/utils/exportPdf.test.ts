import { describe, expect, it, vi } from "vitest";
import { generateExportHtml, exportDataToPdf } from "./exportPdf";
import type { ExportDataDto } from "@/features/users/users.dto";

describe("exportPdf utility (PB17)", () => {
  const sampleData: ExportDataDto = {
    exportedAt: "2026-11-10T10:00:00.000Z",
    account: {
      id: "usr_mock_123",
      email: "engineer@remotesea.work",
      name: "Tran Van Dev",
      phone: "+84 987 654 321",
      role: "TALENT",
      isPaused: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      language: "vi",
      region: "VN",
      currencyDisplay: "USD",
      talent: {
        headline: "Principal React Architect",
        bio: "Senior engineer with 10 years experience",
        skills: [
          { skill: { name: "React" } },
          { skill: { name: "TypeScript" } },
        ],
        applications: [
          {
            id: "app_1",
            status: "ACCEPTED",
            createdAt: "2026-03-01T00:00:00.000Z",
            job: { title: "Lead Frontend Engineer", slug: "lead-fe" },
          },
        ],
      },
      jobAlerts: [
        {
          id: "alert_1",
          keywords: "React Lead",
          frequency: "DAILY",
          isActive: true,
        },
      ],
      notificationPreference: {
        emailAlerts: true,
        applicationUpdates: true,
      },
      messages: [
        {
          applicationId: "app_1",
          body: "Hello, looking forward to discussing the role.",
          createdAt: "2026-03-02T00:00:00.000Z",
        },
      ],
    },
  };

  it("generates well-structured HTML report in Vietnamese", () => {
    const html = generateExportHtml(sampleData, "vi");
    expect(html).toContain("RemoteSEA · Hồ Sơ Dữ Liệu Cá Nhân");
    expect(html).toContain("Tran Van Dev");
    expect(html).toContain("engineer@remotesea.work");
    expect(html).toContain("Principal React Architect");
    expect(html).toContain("React");
    expect(html).toContain("Lead Frontend Engineer");
    expect(html).toContain("Bản lưu dữ liệu cá nhân");
    expect(html).not.toContain("tuân thủ Điều 20");
    expect(html).toContain("KHÔNG chứa chuỗi mã hóa mật khẩu");
  });

  it("generates well-structured HTML report in English", () => {
    const html = generateExportHtml(sampleData, "en");
    expect(html).toContain("RemoteSEA · Personal Data Archive");
    expect(html).toContain("Personal data archive");
    expect(html).not.toContain("GDPR / PDPA Compliance Dossier");
    expect(html).toContain("Tran Van Dev");
    expect(html).toContain("Lead Frontend Engineer");
    expect(html).toContain("strictly EXCLUDES password hashes");
  });

  it("mounts an invisible iframe and triggers print", () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    exportDataToPdf(sampleData, "vi");
    expect(appendChildSpy).toHaveBeenCalled();

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
