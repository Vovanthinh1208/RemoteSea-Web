import type { ExportDataDto } from "@/features/users/users.dto";

interface UserExportAccount {
  id?: string;
  email?: string;
  name?: string;
  phone?: string | null;
  role?: string;
  isPaused?: boolean;
  createdAt?: string;
  language?: string;
  region?: string;
  currencyDisplay?: string;
  talent?: {
    headline?: string | null;
    bio?: string | null;
    visibility?: string;
    skills?: Array<{ skill?: { name?: string } }>;
    applications?: Array<{
      id: string;
      status: string;
      createdAt: string;
      job?: { title?: string; slug?: string };
    }>;
  };
  employer?: {
    companyName?: string;
    jobs?: Array<{
      title: string;
      slug: string;
      status: string;
      createdAt: string;
      publishedAt?: string | null;
    }>;
  };
  jobAlerts?: Array<{
    id: string;
    keywords?: string;
    frequency?: string;
    isActive?: boolean;
  }>;
  notificationPreference?: {
    emailAlerts?: boolean;
    jobRecommendations?: boolean;
    applicationUpdates?: boolean;
    marketingEmails?: boolean;
  };
  messages?: Array<{
    applicationId: string;
    body: string;
    createdAt: string;
  }>;
}

export const generateExportHtml = (
  exportData: ExportDataDto,
  locale: string = "vi"
): string => {
  const account = (exportData.account || {}) as UserExportAccount;
  const isVi = locale === "vi";
  const exportedAtStr = new Date(
    exportData.exportedAt || Date.now()
  ).toLocaleString(isVi ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const talent = account.talent;
  const employer = account.employer;
  const apps = talent?.applications || [];
  const jobs = employer?.jobs || [];
  const alerts = account.jobAlerts || [];
  const messages = account.messages || [];
  const notifs = account.notificationPreference || {};
  const skills =
    talent?.skills?.map((s) => s.skill?.name).filter(Boolean) || [];

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<title>RemoteSEA - Personal Data Export Dossier</title>
<style>
  @page {
    size: A4 portrait;
    margin: 15mm 12mm 15mm 12mm;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.45;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }
  .header {
    background: #0f172a;
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 6px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand {
    font-size: 14pt;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .brand-sub {
    font-size: 8pt;
    color: #94a3b8;
    margin-top: 2px;
  }
  .badge {
    background-color: #0284c7;
    color: #ffffff;
    font-size: 7.5pt;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }
  .card {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
    background-color: #ffffff;
    margin-bottom: 12px;
  }
  .card-title {
    font-size: 9.5pt;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .data-row {
    display: flex;
    justify-content: space-between;
    padding: 2.5px 0;
    font-size: 8.5pt;
    border-bottom: 1px dashed #f1f5f9;
  }
  .data-row:last-child {
    border-bottom: none;
  }
  .data-key {
    color: #64748b;
    font-weight: 600;
  }
  .data-val {
    color: #0f172a;
    font-weight: 500;
    text-align: right;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px 0;
    font-size: 8pt;
  }
  th {
    background-color: #f1f5f9;
    color: #334155;
    font-weight: 700;
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }
  td {
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
  }
  .tag {
    display: inline-block;
    background-color: #e0f2fe;
    color: #0369a1;
    font-size: 7.5pt;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    margin: 2px 4px 2px 0;
  }
  .status-active {
    color: #166534;
    font-weight: 700;
  }
  .status-paused {
    color: #92400e;
    font-weight: 700;
  }
  .security-footer {
    margin-top: 14px;
    padding: 10px 12px;
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 7.5pt;
    color: #475569;
    line-height: 1.4;
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">RemoteSEA · ${isVi ? "Hồ Sơ Dữ Liệu Cá Nhân" : "Personal Data Archive"}</div>
    <div class="brand-sub">${isVi ? "Bản lưu dữ liệu cá nhân · Thời điểm xuất:" : "Personal data archive · Exported at:"} ${exportedAtStr}</div>
  </div>
  <div class="badge">Personal Data Export</div>
</div>

<div class="grid-2">
  <div class="card">
    <div class="card-title">${isVi ? "1. Thông tin tài khoản định danh" : "1. Account Identity"}</div>
    <div class="data-row"><span class="data-key">User ID:</span><span class="data-val">${account.id ?? "N/A"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Họ và tên:" : "Full Name:"}</span><span class="data-val">${account.name ?? "N/A"}</span></div>
    <div class="data-row"><span class="data-key">Email:</span><span class="data-val">${account.email ?? "N/A"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Số điện thoại:" : "Phone:"}</span><span class="data-val">${account.phone || (isVi ? "Chưa cung cấp" : "Not provided")}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Vai trò hệ thống:" : "Role:"}</span><span class="data-val">${account.role ?? "TALENT"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Trạng thái tài khoản:" : "Account Status:"}</span><span class="data-val ${account.isPaused ? "status-paused" : "status-active"}">${account.isPaused ? (isVi ? "Đang tạm dừng" : "Paused") : isVi ? "Đang hoạt động" : "Active"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Ngày khởi tạo:" : "Registered At:"}</span><span class="data-val">${account.createdAt ? new Date(account.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US") : "N/A"}</span></div>
  </div>

  <div class="card">
    <div class="card-title">${isVi ? "2. Tùy chọn hệ thống & Cài đặt thông báo" : "2. Preferences & Notifications"}</div>
    <div class="data-row"><span class="data-key">${isVi ? "Ngôn ngữ:" : "Language:"}</span><span class="data-val">${account.language || (isVi ? "Tiếng Việt (vi)" : "English (en)")}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Khu vực địa lý:" : "Region:"}</span><span class="data-val">${account.region || "Vietnam (VN)"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Đơn vị tiền tệ:" : "Currency Display:"}</span><span class="data-val">${account.currencyDisplay || "USD ($)"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Thông báo việc làm:" : "Job Alerts Email:"}</span><span class="data-val">${notifs.emailAlerts !== false ? (isVi ? "Bật" : "Enabled") : isVi ? "Tắt" : "Disabled"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Cập nhật ứng tuyển:" : "Application Updates:"}</span><span class="data-val">${notifs.applicationUpdates !== false ? (isVi ? "Bật" : "Enabled") : isVi ? "Tắt" : "Disabled"}</span></div>
    <div class="data-row"><span class="data-key">${isVi ? "Gợi ý việc làm phù hợp:" : "Job Recommendations:"}</span><span class="data-val">${notifs.jobRecommendations !== false ? (isVi ? "Bật" : "Enabled") : isVi ? "Tắt" : "Disabled"}</span></div>
  </div>
</div>

${
  talent
    ? `
<div class="card">
  <div class="card-title">${isVi ? "3. Hồ sơ ứng viên (Talent Profile)" : "3. Talent Profile"}</div>
  <div class="data-row"><span class="data-key">${isVi ? "Tiêu đề chuyên môn:" : "Headline:"}</span><span class="data-val">${talent.headline || (isVi ? "Chưa cập nhật" : "Not set")}</span></div>
  <div class="data-row"><span class="data-key">${isVi ? "Giới thiệu bản thân:" : "Bio:"}</span><span class="data-val">${talent.bio || (isVi ? "Chưa cập nhật" : "Not set")}</span></div>
  <div style="margin-top: 6px;">
    <span class="data-key">${isVi ? "Kỹ năng chuyên môn:" : "Skills:"}</span>
    <div style="margin-top: 4px;">
      ${
        skills.length > 0
          ? skills.map((s) => `<span class="tag">${s}</span>`).join("")
          : `<span style="color: #94a3b8; font-style: italic;">${isVi ? "Chưa lưu kỹ năng" : "No skills listed"}</span>`
      }
    </div>
  </div>
</div>
`
    : ""
}

${
  employer
    ? `
<div class="card">
  <div class="card-title">${isVi ? "3. Hồ sơ nhà tuyển dụng (Employer Profile)" : "3. Employer Profile"}</div>
  <div class="data-row"><span class="data-key">${isVi ? "Tên doanh nghiệp:" : "Company Name:"}</span><span class="data-val">${employer.companyName || "N/A"}</span></div>
  <div class="data-row"><span class="data-key">${isVi ? "Số lượng tin tuyển dụng:" : "Total Job Postings:"}</span><span class="data-val">${jobs.length}</span></div>
</div>
`
    : ""
}

${
  apps.length > 0
    ? `
<div class="card">
  <div class="card-title">${isVi ? "4. Lịch sử ứng tuyển việc làm" : "4. Job Application History"} (${apps.length})</div>
  <table>
    <thead>
      <tr>
        <th>${isVi ? "Vị trí công việc" : "Job Title"}</th>
        <th>${isVi ? "Mã ứng tuyển" : "Application ID"}</th>
        <th>${isVi ? "Trạng thái" : "Status"}</th>
        <th>${isVi ? "Ngày nộp" : "Applied Date"}</th>
      </tr>
    </thead>
    <tbody>
      ${apps
        .map(
          (a) => `
      <tr>
        <td><strong>${a.job?.title || "Vị trí đã đóng"}</strong></td>
        <td><code>${a.id.slice(0, 16)}...</code></td>
        <td><span class="badge" style="background:#0284c7;">${a.status}</span></td>
        <td>${new Date(a.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US")}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</div>
`
    : ""
}

${
  jobs.length > 0
    ? `
<div class="card">
  <div class="card-title">${isVi ? "4. Danh mục tin tuyển dụng đã đăng" : "4. Posted Job Listings"} (${jobs.length})</div>
  <table>
    <thead>
      <tr>
        <th>${isVi ? "Tiêu đề tin" : "Job Title"}</th>
        <th>${isVi ? "Đường dẫn" : "Slug"}</th>
        <th>${isVi ? "Trạng thái" : "Status"}</th>
        <th>${isVi ? "Ngày tạo" : "Created At"}</th>
      </tr>
    </thead>
    <tbody>
      ${jobs
        .map(
          (j) => `
      <tr>
        <td><strong>${j.title}</strong></td>
        <td><code>${j.slug}</code></td>
        <td><span class="badge" style="background:#166534;">${j.status}</span></td>
        <td>${new Date(j.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US")}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</div>
`
    : ""
}

${
  alerts.length > 0
    ? `
<div class="card">
  <div class="card-title">${isVi ? "5. Đăng ký thông báo tìm việc (Job Alerts)" : "5. Job Alerts"} (${alerts.length})</div>
  <table>
    <thead>
      <tr>
        <th>${isVi ? "Từ khóa tìm kiếm" : "Search Keywords"}</th>
        <th>${isVi ? "Tần suất gửi" : "Frequency"}</th>
        <th>${isVi ? "Trạng thái" : "Status"}</th>
      </tr>
    </thead>
    <tbody>
      ${alerts
        .map(
          (al) => `
      <tr>
        <td>${al.keywords || (isVi ? "Mọi tin tuyển dụng mới" : "All new listings")}</td>
        <td>${al.frequency || "DAILY"}</td>
        <td><span class="${al.isActive !== false ? "status-active" : "status-paused"}">${al.isActive !== false ? (isVi ? "Hoạt động" : "Active") : isVi ? "Tạm ngưng" : "Paused"}</span></td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</div>
`
    : ""
}

${
  messages.length > 0
    ? `
<div class="card">
  <div class="card-title">${isVi ? "6. Lịch sử tin nhắn đã gửi (Sent Messages)" : "6. Sent Messages History"} (${messages.length})</div>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">${isVi ? "Thời gian" : "Timestamp"}</th>
        <th style="width: 25%;">${isVi ? "Đơn ứng tuyển" : "Application ID"}</th>
        <th>${isVi ? "Nội dung tin nhắn" : "Message Content"}</th>
      </tr>
    </thead>
    <tbody>
      ${messages
        .map(
          (m) => `
      <tr>
        <td>${new Date(m.createdAt).toLocaleString(isVi ? "vi-VN" : "en-US")}</td>
        <td><code>${m.applicationId.slice(0, 16)}...</code></td>
        <td>${m.body}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</div>
`
    : ""
}

<div class="security-footer">
  <strong>${isVi ? "Xác nhận tuân thủ bảo mật & quyền riêng tư (PB17):" : "Security & Privacy Compliance Attestation (PB17):"}</strong><br>
  ${
    isVi
      ? "Bản xuất này chứa các nhóm dữ liệu được RemoteSEA hỗ trợ tại thời điểm tạo và không phải chứng nhận tuân thủ pháp lý. Tệp xuất hoàn toàn KHÔNG chứa chuỗi mã hóa mật khẩu (Password Hash), Salt bảo mật, hoặc mã bí mật xác thực hai bước (2FA TOTP Secret / Backup Codes)."
      : "This archive contains the supported personal data available at export time and is not a certification of legal compliance. This export strictly EXCLUDES password hashes, authentication salts, and two-factor authentication secrets (2FA TOTP / Backup Codes)."
  }
</div>

</body>
</html>`;
};

export const exportDataToPdf = (
  exportData: ExportDataDto,
  locale: string = "vi"
): void => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.title = "Personal Data Export Frame";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  const html = generateExportHtml(exportData, locale);
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Failed to trigger print dialog:", e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 350);
};
