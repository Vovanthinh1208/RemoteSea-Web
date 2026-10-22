/**
 * capture-ui-screenshots.ts — UI evidence capture for the "USER INTERFACE
 * DESIGN" chapter (docs/ui-design/).
 *
 * Drives the real running app (no mocks) with Playwright, logs in through the
 * normal /login form per actor, visits every route in SCREENS, captures
 * viewport + full-page + declared UI states, and writes
 * docs/ui-design/capture-results.json (consumed by
 * scripts/build-ui-design-docs.mjs).
 *
 * Read-only by design: interactions only open menus/tabs/inline forms or
 * submit forms *empty* to trigger client-side (zod) validation. Nothing is
 * created, paid for, e-mailed or deleted. Passwords/tokens are never logged.
 *
 * Usage (Node >= 22.6 strips the types natively, no extra dependency):
 *   CAPTURE_PASSWORD=... node scripts/capture-ui-screenshots.ts
 *   CAPTURE_PASSWORD=... node scripts/capture-ui-screenshots.ts --only=PB47,admin --locale=vi
 *   CAPTURE_PASSWORD=... node scripts/capture-ui-screenshots.ts --design-system
 *   node scripts/build-ui-design-docs.mjs     # regenerate tables/CSV/gallery
 *
 * Env:
 *   CAPTURE_BASE_URL   default http://localhost:3001 (vite dev server)
 *   CAPTURE_API_URL    default http://localhost:4000 (remotesea-api)
 *   CAPTURE_PASSWORD   password of the seeded test accounts (required for
 *                      Talent/Employer/Admin; without it only Guest runs)
 *   CAPTURE_TALENT_EMAIL / CAPTURE_EMPLOYER_EMAIL / CAPTURE_ADMIN_EMAIL
 *                      default to the prisma/seed.ts accounts
 */
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_CONCURRENCY,
  API_URL,
  BASE_URL,
  DESKTOP,
  MOBILE,
  TOKEN_KEY,
  clickByName,
  loginGate,
  maskFor,
  openMenu,
  scrollToId,
  settle,
  submitEmpty,
  throttleApi,
} from "./lib/capture-kit.ts";

// ---------------------------------------------------------------- config ----
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "docs/ui-design");
const SHOT_DIR = path.join(OUT_DIR, "screenshots");
const PASSWORD = process.env.CAPTURE_PASSWORD ?? "";
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);
const LOCALE = args.locale === "vi" ? "vi-VN" : "en-US";
const ONLY = args.only ? String(args.only).split(",") : null;

type Actor = "guest" | "talent" | "employer" | "admin";
const ACCOUNTS: Record<Exclude<Actor, "guest">, string> = {
  talent: process.env.CAPTURE_TALENT_EMAIL ?? "talent1@remotesea.dev",
  employer: process.env.CAPTURE_EMPLOYER_EMAIL ?? "employer1@remotesea.dev",
  admin: process.env.CAPTURE_ADMIN_EMAIL ?? "admin@remotesea.dev",
};

// Runtime-resolved ids for parameterised routes (filled from the API).
interface Ids {
  jobId: string;
  jobForApplyId: string;
  companySlug: string;
  ownCompanySlug: string;
  talentSlug: string; // the capture Talent's own slug (may be non-public)
  publicTalentSlug: string; // first slug the public endpoint actually serves
  appOffered: string;
  appInterview: string;
  appPending: string;
  empAppInterview: string;
  empAppOffered: string;
}

interface State {
  name: string; // file suffix, e.g. "validation-error"
  label: string; // human description (Vietnamese, used in docs)
  run?: (page: Page) => Promise<void>;
  fullPage?: boolean;
  mobile?: boolean;
}

interface Screen {
  id: string;
  sprint: 1 | 2 | 3 | 4 | "shared";
  pbs: string[]; // first = primary (used in file name); "UNMAPPED" allowed
  actor: Actor;
  feature: string; // file-name slug
  screen: string; // file-name slug
  title: string; // Vietnamese display name
  route: string; // route template as declared in AppRouter
  path: (ids: Ids) => string;
  states?: State[];
  mobile?: boolean;
  expectRedirect?: boolean;
}

// Set once by resolveIds(); lets a state reach a second id of the same screen.
let CURRENT_IDS: Ids | null = null;

// Interaction helpers, settle(), throttleApi() and maskFor() live in
// scripts/lib/capture-kit.ts (shared with capture-sprint-01-ui.ts).

// ---------------------------------------------------------------- screens ---
const SCREENS: Screen[] = [
  // ===== Sprint 1 — Guest: auth =====
  {
    id: "S1-LOGIN",
    sprint: 1,
    pbs: ["PB02", "PB03", "PB04", "PB06"],
    actor: "guest",
    feature: "auth",
    screen: "login",
    title: "Đăng nhập",
    route: "/login",
    path: () => "/login",
    mobile: true,
    states: [
      {
        name: "validation-error",
        label: "Gửi form rỗng → lỗi validation",
        run: submitEmpty(),
      },
    ],
  },
  {
    id: "S1-REGISTER",
    sprint: 1,
    pbs: ["PB01", "PB04"],
    actor: "guest",
    feature: "auth",
    screen: "register",
    title: "Đăng ký tài khoản",
    route: "/register",
    path: () => "/register",
    mobile: true,
    states: [
      {
        name: "validation-error",
        label: "Gửi form rỗng → lỗi validation",
        run: submitEmpty(),
      },
      {
        name: "employer-role",
        label: "Chọn vai trò Nhà tuyển dụng",
        run: (p) => clickByName(p, /employer|hire|nhà tuyển dụng|tuyển dụng/i),
      },
    ],
  },
  {
    id: "S1-FORGOT",
    sprint: 1,
    pbs: ["PB06"],
    actor: "guest",
    feature: "auth",
    screen: "forgot-password",
    title: "Quên mật khẩu",
    route: "/forgot-password",
    path: () => "/forgot-password",
    states: [
      {
        name: "validation-error",
        label: "Gửi form rỗng → lỗi validation",
        run: submitEmpty(),
      },
    ],
  },
  {
    id: "S1-RESET",
    sprint: 1,
    pbs: ["PB07"],
    actor: "guest",
    feature: "auth",
    screen: "reset-password",
    title: "Đặt lại mật khẩu (thiếu token)",
    route: "/reset-password",
    path: () => "/reset-password",
    states: [
      {
        name: "with-token",
        label: "Có tham số token (giả) → hiển thị form",
        run: async (p) => {
          await p.goto(`${BASE_URL}/reset-password?token=sample-token-for-ui`);
          await settle(p);
        },
      },
    ],
  },
  {
    id: "S1-OAUTH-CALLBACK",
    sprint: 1,
    pbs: ["PB04"],
    actor: "guest",
    feature: "auth",
    screen: "oauth-callback",
    title: "OAuth callback (không có mã)",
    route: "/auth/callback",
    path: () => "/auth/callback",
  },
  {
    id: "S1-TALENT-VERIFY",
    sprint: 1,
    pbs: ["PB22"],
    actor: "guest",
    feature: "talent",
    screen: "email-verify",
    title: "Xác minh email ứng viên (không có token)",
    route: "/talent/verify",
    path: () => "/talent/verify",
  },
  {
    id: "S1-AUTH-GUARD",
    sprint: 1,
    pbs: ["PB08"],
    actor: "guest",
    feature: "auth",
    screen: "protected-redirect",
    title: "Truy cập trang cần đăng nhập → chuyển về /login",
    route: "/settings (guest)",
    path: () => "/settings",
    expectRedirect: true,
  },
  // ===== Sprint 1 — Talent: account settings + profile =====
  {
    id: "S1-SETTINGS",
    sprint: 1,
    pbs: [
      "PB12",
      "PB05",
      "PB10",
      "PB11",
      "PB13",
      "PB14",
      "PB15",
      "PB16",
      "PB17",
      "PB18",
      "PB19",
      "PB20",
    ],
    actor: "talent",
    feature: "settings",
    screen: "account-settings",
    title: "Cài đặt tài khoản",
    route: "/settings",
    path: () => "/settings",
    mobile: true,
    states: [
      {
        name: "security",
        label: "Mục Bảo mật (mật khẩu, 2FA, phiên đăng nhập)",
        run: scrollToId("security"),
      },
      {
        name: "connected",
        label: "Mục Tài khoản liên kết (OAuth)",
        run: scrollToId("connected"),
      },
      {
        name: "notifications",
        label: "Mục Tuỳ chọn thông báo",
        run: scrollToId("notifications"),
      },
      {
        name: "privacy",
        label: "Mục Quyền riêng tư & dữ liệu",
        run: scrollToId("data"),
      },
      {
        name: "danger-zone",
        label: "Vùng nguy hiểm (tạm dừng / xoá tài khoản)",
        run: scrollToId("danger"),
      },
      {
        name: "change-password-validation",
        label: "Form đổi mật khẩu gửi rỗng → lỗi validation",
        run: async (p) => {
          await scrollToId("security")(p);
          const btn = p
            .getByRole("button", {
              name: /change password|update password|đổi mật khẩu|cập nhật mật khẩu/i,
            })
            .first();
          await btn.click();
          await p.waitForTimeout(400);
          const upd = p
            .getByRole("button", { name: /update password|cập nhật mật khẩu/i })
            .first();
          if (await upd.isVisible().catch(() => false)) await upd.click();
          await p.waitForTimeout(500);
        },
      },
      {
        name: "delete-confirm",
        label: "Mở hộp xác nhận xoá tài khoản (không xác nhận)",
        run: async (p) => {
          await scrollToId("danger")(p);
          // Opens the inline confirm step only; "Yes, delete" is never clicked.
          await clickByName(
            p,
            /^(delete account|xoá tài khoản|xóa tài khoản)$/i
          );
        },
      },
      {
        name: "language-menu",
        label: "Mở menu chọn ngôn ngữ trên navbar",
        run: openMenu(/language|ngôn ngữ/i),
      },
    ],
  },
  {
    id: "S1-PROFILE",
    sprint: 1,
    pbs: ["PB21", "PB23", "PB24", "PB25", "PB52"],
    actor: "talent",
    feature: "talent-profile",
    screen: "profile-editor",
    title: "Tạo / cập nhật hồ sơ ứng viên",
    route: "/profile",
    path: () => "/profile",
    mobile: true,
    states: [
      {
        name: "experience",
        label: "Mục Kinh nghiệm làm việc (PB24)",
        run: scrollToId("experience"),
      },
      {
        name: "skills",
        label: "Mục Kỹ năng — gợi ý kỹ năng chuẩn (PB52)",
        run: scrollToId("skills"),
      },
      {
        name: "highlights",
        label: "Mục Điểm nhấn / portfolio / học vấn / ngôn ngữ (PB25)",
        run: scrollToId("highlights"),
      },
      {
        name: "visibility",
        label: "Mục Chế độ hiển thị hồ sơ (PB23)",
        run: scrollToId("visibility"),
      },
      {
        name: "add-experience-form",
        label: "Mở form thêm kinh nghiệm làm việc",
        run: async (p) => {
          await clickByName(p, /add (your first|another) role|thêm/i);
        },
      },
      {
        name: "add-experience-validation",
        label: "Form kinh nghiệm gửi rỗng → lỗi validation",
        run: async (p) => {
          await clickByName(p, /add (your first|another) role/i);
          await clickByName(p, /^add role$/i);
        },
      },
    ],
  },
  {
    id: "S1-LOGOUT",
    sprint: 1,
    pbs: ["PB09"],
    actor: "talent",
    feature: "auth",
    screen: "sign-out",
    title: "Đăng xuất (hộp xác nhận trên navbar)",
    route: "(navbar, mọi trang)",
    path: () => "/jobs",
    states: [
      {
        name: "confirm-dialog",
        label: "Bấm 'Sign out' → hộp xác nhận (không xác nhận)",
        run: (p) => clickByName(p, /^sign out$|^đăng xuất$/i),
      },
    ],
  },
  {
    id: "S1-SPRINT-BOARD",
    sprint: 1,
    pbs: ["UNMAPPED"],
    actor: "guest",
    feature: "internal",
    screen: "sprint-board",
    title: "Sprint Board (công cụ nội bộ kiểm thử)",
    route: "/sprints",
    path: () => "/sprints",
  },

  // ===== Sprint 2 =====
  {
    id: "S2-JOBS",
    sprint: 2,
    pbs: ["PB47", "PB49", "PB51"],
    actor: "guest",
    feature: "jobs",
    screen: "job-board",
    title: "Tìm kiếm & lọc việc làm",
    route: "/jobs",
    path: () => "/jobs",
    mobile: true,
    states: [
      // Any non-empty ?q= currently makes GET /jobs answer 500 (issues-and-gaps A4),
      // so this state shows the board's error state, not search results.
      {
        name: "search-error",
        label:
          "Tìm theo từ khoá 'engineer' → API 500 → trạng thái lỗi 'Couldn't load jobs' + Try again",
        run: async (p) => {
          await p.goto(`${BASE_URL}/jobs?q=engineer`);
          await settle(p);
        },
      },
      {
        name: "filtered",
        label: "Lọc Full-time + Senior, sắp xếp theo lương",
        run: async (p) => {
          await p.goto(
            `${BASE_URL}/jobs?type=Full-time&level=Senior&sort=salary`
          );
          await settle(p);
        },
      },
      {
        name: "empty-result",
        label: "Bộ lọc không có kết quả (AU-based company = 0) → empty state",
        run: async (p) => {
          await p.goto(`${BASE_URL}/jobs?tz=AU`);
          await settle(p);
        },
      },
      {
        name: "mobile-filters",
        label: "Mở bộ lọc trên mobile",
        mobile: true,
        run: (p) => clickByName(p, /filters|bộ lọc/i),
      },
    ],
  },
  {
    id: "S2-JOB-DETAIL",
    sprint: 2,
    pbs: ["PB48", "PB82"],
    actor: "guest",
    feature: "jobs",
    screen: "job-detail",
    title: "Chi tiết tin tuyển dụng (khách)",
    route: "/jobs/:id",
    path: (i) => `/jobs/${i.jobId}`,
    mobile: true,
    states: [
      {
        name: "apply-as-guest",
        label: "Khách bấm Ứng tuyển → chuyển tới đăng nhập",
        run: (p) => clickByName(p, /apply/i),
      },
    ],
  },
  {
    id: "S2-COMPANY",
    sprint: 2,
    pbs: ["PB33", "PB72"],
    actor: "guest",
    feature: "company",
    screen: "public-company",
    title: "Hồ sơ công ty công khai",
    route: "/companies/:slug",
    path: (i) => `/companies/${i.companySlug}`,
    mobile: true,
  },
  {
    id: "S2-TALENT-PUBLIC",
    sprint: 2,
    pbs: ["PB28", "PB72"],
    actor: "guest",
    feature: "talent",
    screen: "public-profile",
    title: "Hồ sơ công khai ứng viên",
    route: "/talent/:slug",
    path: (i) => `/talent/${i.publicTalentSlug}`,
    mobile: true,
    states: [
      {
        name: "private-profile",
        label:
          "Hồ sơ đặt chế độ VERIFIED_EMPLOYERS → khách thấy 'Profile not found' (PB23)",
        run: async (p) => {
          await p.goto(`${BASE_URL}/talent/${CURRENT_IDS?.talentSlug}`);
          await settle(p);
        },
      },
    ],
  },
  {
    id: "S2-EMPLOYER-VERIFY",
    sprint: 2,
    pbs: ["PB32"],
    actor: "guest",
    feature: "employer",
    screen: "domain-verify",
    title: "Xác minh công ty qua email tên miền (không có token)",
    route: "/employer/verify",
    path: () => "/employer/verify",
  },
  {
    id: "S2-TEAM-INVITE",
    sprint: 2,
    pbs: ["PB36"],
    actor: "guest",
    feature: "team",
    screen: "accept-invitation",
    title: "Chấp nhận lời mời gia nhập công ty (token không hợp lệ)",
    route: "/team/invitations/:token",
    path: () => "/team/invitations/invalid-sample-token",
  },
  {
    id: "S2-POSTJOB-SUCCESS",
    sprint: 2,
    pbs: ["PB43", "PB80", "PB81"],
    actor: "guest",
    feature: "billing",
    screen: "checkout-return",
    title: "Trang trả về sau Stripe Checkout (không có session)",
    route: "/post-job/success",
    path: () => "/post-job/success",
  },
  {
    id: "S2-TALENT-DASH",
    sprint: 2,
    pbs: ["PB26", "PB27", "PB22", "PB54"],
    actor: "talent",
    feature: "talent-dashboard",
    screen: "dashboard",
    title: "Bảng điều khiển ứng viên",
    route: "/talent",
    path: () => "/talent",
    mobile: true,
    states: [
      {
        name: "tab-all",
        label: "Tab Tất cả đơn ứng tuyển",
        run: async (p) => {
          await p.goto(`${BASE_URL}/talent?appTab=all`);
          await settle(p);
          await p
            .getByText(/applications/i)
            .first()
            .scrollIntoViewIfNeeded()
            .catch(() => {});
        },
      },
      {
        name: "tab-offers",
        label: "Tab Offer",
        run: async (p) => {
          await p.goto(`${BASE_URL}/talent?appTab=offers`);
          await settle(p);
        },
      },
      {
        name: "tab-closed",
        label: "Tab Đã đóng",
        run: async (p) => {
          await p.goto(`${BASE_URL}/talent?appTab=closed`);
          await settle(p);
        },
      },
      {
        name: "user-menu",
        label: "Navbar khi đã đăng nhập — mở thông báo (chuông)",
        run: openMenu(/notifications|thông báo/i),
      },
    ],
  },
  {
    id: "S2-JOB-DETAIL-TALENT",
    sprint: 2,
    pbs: ["PB48", "PB50", "PB53", "PB49", "PB88"],
    actor: "talent",
    feature: "jobs",
    screen: "job-detail-talent",
    title:
      "Chi tiết việc làm (ứng viên đăng nhập: Match Score, Ứng tuyển, Báo cáo)",
    route: "/jobs/:id",
    path: (i) => `/jobs/${i.jobForApplyId}`,
    states: [
      {
        name: "apply-form",
        label: "Mở form ứng tuyển inline (không gửi)",
        run: (p) => clickByName(p, /apply/i),
      },
      {
        name: "report-form",
        label: "Mở form báo cáo vi phạm (không gửi)",
        run: (p) => clickByName(p, /report this job|báo cáo/i),
      },
    ],
  },
  {
    id: "S2-EMP-DASH",
    sprint: 2,
    pbs: ["PB34", "PB57", "PB59", "PB45", "PB31", "PB32"],
    actor: "employer",
    feature: "employer-dashboard",
    screen: "dashboard",
    title: "Bảng điều khiển nhà tuyển dụng",
    route: "/employer-dashboard",
    path: () => "/employer-dashboard",
    mobile: true,
    states: [
      {
        name: "tab-new",
        label: "Tab ứng viên Mới",
        run: async (p) => {
          await p.goto(`${BASE_URL}/employer-dashboard?applicantTab=new`);
          await settle(p);
        },
      },
      {
        name: "tab-shortlisted",
        label: "Tab ứng viên Shortlist",
        run: async (p) => {
          await p.goto(
            `${BASE_URL}/employer-dashboard?applicantTab=shortlisted`
          );
          await settle(p);
        },
      },
      // bulk-select (PB59) needs the applicants panel, which never renders
      // while GET /employer/dashboard answers 500 (issues-and-gaps A3).
    ],
  },
  {
    id: "S2-POSTJOB",
    sprint: 2,
    pbs: ["PB41", "PB30", "PB42", "PB43"],
    actor: "employer",
    feature: "post-job",
    screen: "wizard",
    title: "Đăng tin tuyển dụng (wizard 4 bước)",
    route: "/post-job",
    path: () => "/post-job",
    mobile: true,
    states: [
      {
        name: "step2-role",
        label: "Bước 2 — Vai trò",
        run: (p) => clickByName(p, /continue|tiếp tục/i),
      },
      {
        name: "step2-validation",
        label: "Bước 2 bấm Tiếp tục khi chưa nhập → lỗi bước",
        run: async (p) => {
          await clickByName(p, /continue|tiếp tục/i);
          await clickByName(p, /continue|tiếp tục/i);
        },
      },
    ],
  },
  {
    id: "S2-TALENT-SEARCH",
    sprint: 2,
    pbs: ["PB29", "PB79"],
    actor: "employer",
    feature: "talent-search",
    screen: "talent-search",
    title: "Tìm kiếm ứng viên",
    route: "/employer-dashboard/talent",
    path: () => "/employer-dashboard/talent",
    mobile: true,
    states: [
      {
        name: "filtered",
        label: "Lọc cấp độ Senior",
        run: async (p) => {
          await p.goto(`${BASE_URL}/employer-dashboard/talent?level=SENIOR`);
          await settle(p);
        },
      },
      {
        name: "search",
        label: "Tìm theo từ khoá 'engineer'",
        run: async (p) => {
          await p.goto(`${BASE_URL}/employer-dashboard/talent?q=engineer`);
          await settle(p);
        },
      },
    ],
  },
  {
    id: "S2-TEAM",
    sprint: 2,
    pbs: ["PB37", "PB35", "PB38", "PB39", "PB40"],
    actor: "employer",
    feature: "team",
    screen: "team-settings",
    title: "Quản lý thành viên công ty",
    route: "/employer-dashboard/team",
    path: () => "/employer-dashboard/team",
    states: [
      {
        name: "invite-validation",
        label: "Form mời thành viên gửi rỗng → lỗi validation",
        run: submitEmpty(),
      },
    ],
  },
  {
    id: "S2-COMPANY-OWNER",
    sprint: 2,
    pbs: ["PB31", "PB33"],
    actor: "employer",
    feature: "company",
    screen: "own-company",
    title: "Trang công ty của chính nhà tuyển dụng",
    route: "/companies/:slug",
    path: (i) => `/companies/${i.ownCompanySlug}`,
  },

  // ===== Sprint 3 =====
  {
    id: "S3-SAVED",
    sprint: 3,
    pbs: ["PB49"],
    actor: "talent",
    feature: "saved-jobs",
    screen: "saved-jobs",
    title: "Việc làm đã lưu",
    route: "/saved",
    path: () => "/saved",
  },
  {
    id: "S3-APP-DETAIL-OFFER",
    sprint: 3,
    pbs: ["PB54", "PB56", "PB55", "PB70", "PB71"],
    actor: "talent",
    feature: "applications",
    screen: "application-offer",
    title: "Chi tiết đơn ứng tuyển — trạng thái Offer",
    route: "/applications/:id",
    path: (i) => `/applications/${i.appOffered}`,
    mobile: true,
  },
  {
    id: "S3-APP-DETAIL-INTERVIEW",
    sprint: 3,
    pbs: ["PB54", "PB61"],
    actor: "talent",
    feature: "applications",
    screen: "application-interview",
    title: "Chi tiết đơn ứng tuyển — trạng thái Phỏng vấn",
    route: "/applications/:id",
    path: (i) => `/applications/${i.appInterview}`,
  },
  {
    id: "S3-APP-DETAIL-PENDING",
    sprint: 3,
    pbs: ["PB54", "PB55"],
    actor: "talent",
    feature: "applications",
    screen: "application-pending",
    title: "Chi tiết đơn ứng tuyển — trạng thái Chờ xử lý",
    route: "/applications/:id",
    path: (i) => `/applications/${i.appPending}`,
  },
  {
    id: "S3-MESSAGES-TALENT",
    sprint: 3,
    pbs: ["PB68"],
    actor: "talent",
    feature: "messages",
    screen: "thread",
    title: "Nhắn tin theo đơn ứng tuyển (ứng viên)",
    route: "/applications/:id/messages",
    path: (i) => `/applications/${i.appInterview}/messages`,
    mobile: true,
  },
  {
    id: "S3-INTERVIEW-TALENT",
    sprint: 3,
    pbs: ["PB61", "PB63"],
    actor: "talent",
    feature: "interviews",
    screen: "interview-talent",
    title: "Lịch phỏng vấn (ứng viên xác nhận / tải .ics)",
    route: "/applications/:id/interview",
    path: (i) => `/applications/${i.appInterview}/interview`,
  },
  {
    id: "S3-NOTIFICATIONS",
    sprint: 3,
    pbs: ["PB73", "PB74", "PB75"],
    actor: "talent",
    feature: "notifications",
    screen: "notifications",
    title: "Trung tâm thông báo",
    route: "/notifications",
    path: () => "/notifications",
    mobile: true,
    states: [
      {
        name: "bell-dropdown",
        label: "Dropdown chuông thông báo + số chưa đọc",
        run: openMenu(/notifications|thông báo/i),
      },
    ],
  },
  {
    id: "S3-WORKSPACE",
    sprint: 3,
    pbs: ["PB58", "PB57", "PB60", "PB64", "PB65", "PB66", "PB67", "PB69"],
    actor: "employer",
    feature: "hiring",
    screen: "application-workspace",
    title:
      "Không gian xử lý hồ sơ ứng viên (pipeline, scorecard, AI CV, ghi chú)",
    route: "/employer-dashboard/applications/:id",
    path: (i) => `/employer-dashboard/applications/${i.empAppInterview}`,
    mobile: true,
    // No scorecard-form state: the capture employer already submitted feedback
    // on this application, so the workspace shows "Your feedback" instead of
    // an "Add feedback" form (and creating one would write to a seed account).
  },
  {
    id: "S3-WORKSPACE-OFFER",
    sprint: 3,
    pbs: ["PB58", "PB65"],
    actor: "employer",
    feature: "hiring",
    screen: "application-workspace-offer",
    title: "Không gian xử lý hồ sơ — ứng viên ở trạng thái Offer",
    route: "/employer-dashboard/applications/:id",
    path: (i) => `/employer-dashboard/applications/${i.empAppOffered}`,
  },
  {
    id: "S3-INTERVIEWS-UPCOMING",
    sprint: 3,
    pbs: ["PB60"],
    actor: "employer",
    feature: "interviews",
    screen: "upcoming",
    title: "Lịch phỏng vấn sắp tới của đội tuyển dụng",
    route: "/employer-dashboard/interviews",
    path: () => "/employer-dashboard/interviews",
  },
  {
    id: "S3-MESSAGES-EMPLOYER",
    sprint: 3,
    pbs: ["PB68"],
    actor: "employer",
    feature: "messages",
    screen: "thread-employer",
    title: "Nhắn tin theo đơn ứng tuyển (nhà tuyển dụng)",
    route: "/applications/:id/messages",
    path: (i) => `/applications/${i.empAppInterview}/messages`,
  },
  {
    id: "S3-INTERVIEW-EMPLOYER",
    sprint: 3,
    pbs: ["PB60", "PB62", "PB63"],
    actor: "employer",
    feature: "interviews",
    screen: "interview-employer",
    title: "Lịch phỏng vấn (nhà tuyển dụng đề xuất / huỷ)",
    route: "/applications/:id/interview",
    path: (i) => `/applications/${i.empAppInterview}/interview`,
  },

  // ===== Sprint 4 =====
  {
    id: "S4-ALERTS",
    sprint: 4,
    pbs: ["PB76", "PB77"],
    actor: "talent",
    feature: "alerts",
    screen: "job-alerts",
    title: "Cảnh báo việc làm",
    route: "/alerts",
    path: () => "/alerts",
    mobile: true,
    states: [
      {
        name: "create-validation",
        label: "Form tạo cảnh báo gửi rỗng → lỗi validation",
        run: async (p) => {
          const form = p.locator("form").first();
          await form.locator("input").first().fill("");
          await form
            .getByRole("button", { name: /create alert|tạo cảnh báo/i })
            .click();
          await p.waitForTimeout(500);
        },
      },
    ],
  },
  {
    id: "S4-SALARY",
    sprint: 4,
    pbs: ["PB82"],
    actor: "guest",
    feature: "salary",
    screen: "salary-insights",
    title: "Tham khảo mức lương",
    route: "/salary",
    path: () => "/salary",
    mobile: true,
  },
  ...(
    [
      ["queue", ["PB85", "PB86", "PB87"], "Hàng đợi kiểm duyệt tin"],
      ["employers", ["PB83", "PB84"], "Quản lý nhà tuyển dụng"],
      ["users", ["PB90", "PB91", "PB92"], "Quản lý người dùng"],
      ["reports", ["PB89", "PB88"], "Xử lý báo cáo vi phạm"],
      ["revenue", ["UNMAPPED"], "Doanh thu"],
      ["audit-log", ["PB93"], "Nhật ký quản trị"],
    ] as const
  ).map(([tab, pbs, title]): Screen => ({
    id: `S4-ADMIN-${tab.toUpperCase()}`,
    sprint: 4,
    pbs: [...pbs],
    actor: "admin",
    feature: "admin",
    screen: tab,
    title: `Admin — ${title}`,
    route: `/admin?tab=${tab}`,
    path: () => `/admin?tab=${tab}`,
    mobile: tab === "queue",
    states:
      tab === "users"
        ? [
            {
              name: "filter-employer",
              label: "Lọc vai trò EMPLOYER",
              run: async (p) => {
                await p.goto(`${BASE_URL}/admin?tab=users&role=EMPLOYER`);
                await settle(p);
              },
            },
            {
              name: "search",
              label: "Tìm kiếm 'talent'",
              run: async (p) => {
                await p.goto(`${BASE_URL}/admin?tab=users&q=talent`);
                await settle(p);
              },
            },
          ]
        : tab === "queue"
          ? [
              {
                name: "item-selected",
                label: "Chọn tin thứ 2 trong hàng đợi",
                run: async (p) => {
                  // QueueListRow is a bare <button class="… items-start … text-left">.
                  const items = p.locator("main button.items-start.text-left");
                  if ((await items.count()) > 1) await items.nth(1).click();
                  await settle(p);
                },
              },
            ]
          : undefined,
  })),
  {
    id: "S4-ROLE-GUARD",
    sprint: 4,
    pbs: ["PB92"],
    actor: "talent",
    feature: "admin",
    screen: "role-guard",
    title: "Ứng viên truy cập /admin → bị chuyển về trang chủ",
    route: "/admin (talent)",
    path: () => "/admin",
    expectRedirect: true,
  },

  // ===== Shared / unmapped =====
  {
    id: "SH-HOME",
    sprint: "shared",
    pbs: ["UNMAPPED"],
    actor: "guest",
    feature: "public",
    screen: "homepage",
    title: "Trang chủ (Landing page)",
    route: "/",
    path: () => "/",
    mobile: true,
    states: [
      {
        name: "mobile-menu",
        label: "Mở menu điều hướng trên mobile",
        mobile: true,
        run: openMenu(/open menu|mở menu|menu/i),
      },
    ],
  },
  {
    id: "SH-EMPLOYER-MKT",
    sprint: "shared",
    pbs: ["UNMAPPED"],
    actor: "guest",
    feature: "public",
    screen: "employer-marketing",
    title: "Trang giới thiệu cho nhà tuyển dụng (bảng giá, FAQ)",
    route: "/employer",
    path: () => "/employer",
    mobile: true,
  },
  {
    id: "SH-BLOG",
    sprint: "shared",
    pbs: ["UNMAPPED"],
    actor: "guest",
    feature: "public",
    screen: "blog",
    title: "Blog",
    route: "/blog",
    path: () => "/blog",
  },
  {
    id: "SH-COMMUNITY",
    sprint: "shared",
    pbs: ["UNMAPPED"],
    actor: "guest",
    feature: "public",
    screen: "community",
    title: "Cộng đồng",
    route: "/community",
    path: () => "/community",
  },
  {
    id: "SH-404",
    sprint: "shared",
    pbs: ["UNMAPPED"],
    actor: "guest",
    feature: "error",
    screen: "not-found",
    title: "Trang 404",
    route: "*",
    path: () => "/this-page-does-not-exist",
  },
];

// ------------------------------------------------------------- id lookup ----
const api = async (p: string, token?: string) => {
  const res = await fetch(API_URL + p, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`GET ${p} -> ${res.status}`);
  return res.json();
};

const resolveIds = async (
  tokens: Partial<Record<Actor, string>>
): Promise<Ids> => {
  const jobs = (await api("/jobs")).jobs as Array<{
    id: string;
    employer: { slug: string };
  }>;
  const ids: Partial<Ids> = {
    jobId: jobs[0]?.id,
    companySlug: jobs[0]?.employer.slug,
  };
  if (tokens.talent) {
    const me = await api("/talent/me", tokens.talent);
    ids.talentSlug = me.slug;
    const apps = (await api("/applications", tokens.talent))
      .applications as Array<{ id: string; status: string; jobId: string }>;
    const applied = new Set(apps.map((a) => a.jobId));
    ids.jobForApplyId = jobs.find((j) => !applied.has(j.id))?.id ?? jobs[0]?.id;
    ids.appOffered = apps.find((a) => a.status === "OFFERED")?.id;
    ids.appPending = apps.find((a) => a.status === "PENDING")?.id;
    for (const a of apps.filter((x) => x.status === "INTERVIEW")) {
      const iv = await api(
        `/applications/${a.id}/interview`,
        tokens.talent
      ).catch(() => null);
      if (iv?.interview) {
        ids.appInterview = a.id;
        break;
      }
    }
  }
  if (tokens.employer) {
    ids.ownCompanySlug = (await api("/employer/profile", tokens.employer)).slug;
    const recent = (await api("/employer/applications/recent", tokens.employer))
      .applications as Array<{ id: string; status: string }>;
    ids.empAppInterview =
      ids.appInterview && recent.some((a) => a.id === ids.appInterview)
        ? ids.appInterview
        : recent.find((a) => a.status === "INTERVIEW")?.id;
    ids.empAppOffered = recent.find((a) => a.status === "OFFERED")?.id;
  }
  const candidates =
    (
      await api("/talent?limit=20", tokens.employer).catch(() => ({
        talents: [],
      }))
    ).talents ?? [];
  for (const t of candidates as Array<{ slug: string }>) {
    if (
      await api(`/talent/${t.slug}`).then(
        () => true,
        () => false
      )
    ) {
      ids.publicTalentSlug = t.slug;
      break;
    }
  }
  ids.talentSlug ??= ids.publicTalentSlug;
  CURRENT_IDS = ids as Ids;
  return ids as Ids;
};

// ----------------------------------------------------------------- login ----
const loginViaUi = async (browser: Browser, actor: Exclude<Actor, "guest">) => {
  await loginGate();
  const ctx = await browser.newContext({ viewport: DESKTOP, locale: LOCALE });
  await throttleApi(ctx);
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/login`);
  await page.locator("#email").fill(ACCOUNTS[actor]);
  await page.locator("#password").fill(PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), {
    timeout: 20_000,
  });
  await settle(page);
  const token = await page.evaluate(
    (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
    TOKEN_KEY
  );
  const storage = await ctx.storageState();
  await ctx.close();
  if (!token) throw new Error(`login for ${actor} produced no token`);
  return { token, storage };
};

// --------------------------------------------------------------- capture ----
interface Shot {
  file: string;
  state: string;
  label: string;
  viewport: "desktop" | "mobile";
  fullPage: boolean;
  bytes: number;
  ok: boolean;
  error?: string;
}
interface Result {
  screen: Omit<Screen, "path" | "states"> & { states: string[] };
  url: string;
  finalUrl: string;
  redirected: boolean;
  status: string;
  retried?: boolean;
  shots: Shot[];
  apiErrors: string[];
  consoleErrors: string[];
  dom?: {
    title: string;
    headings: string[];
    buttons: string[];
    inputs: number;
    forms: number;
    tables: number;
    links: number;
    textLength: number;
  };
}

const folderFor = (s: Screen) =>
  s.sprint === "shared" ? "shared" : `sprint-0${s.sprint}`;
const fileFor = (s: Screen, state: string) =>
  `${s.pbs[0].replace("UNMAPPED", "UNMAPPED")}-${s.actor}-${s.feature}-${s.screen}-${state}.png`;

const snap = async (
  page: Page,
  s: Screen,
  state: string,
  label: string,
  viewport: "desktop" | "mobile",
  fullPage: boolean
): Promise<Shot> => {
  const dir = path.join(SHOT_DIR, folderFor(s));
  mkdirSync(dir, { recursive: true });
  const file = path.join(folderFor(s), fileFor(s, state));
  try {
    await page.screenshot({
      path: path.join(SHOT_DIR, file),
      fullPage,
      animations: "disabled",
      mask: maskFor(page),
      maskColor: "#d4d4d8",
    });
    return {
      file,
      state,
      label,
      viewport,
      fullPage,
      bytes: statSync(path.join(SHOT_DIR, file)).size,
      ok: true,
    };
  } catch (e) {
    return {
      file,
      state,
      label,
      viewport,
      fullPage,
      bytes: 0,
      ok: false,
      error: String(e).slice(0, 200),
    };
  }
};

const domSummary = (page: Page) =>
  page.evaluate(() => {
    const main = document.querySelector("main") ?? document.body;
    const uniq = (xs: string[]) => [
      ...new Set(xs.map((x) => x.replace(/\s+/g, " ").trim()).filter(Boolean)),
    ];
    return {
      title: document.title,
      headings: uniq(
        [...main.querySelectorAll("h1,h2,h3")].map(
          (h) => `${h.tagName}: ${h.textContent}`
        )
      ).slice(0, 30),
      buttons: uniq(
        [...main.querySelectorAll("button, a[role=button]")].map(
          (b) => b.getAttribute("aria-label") || b.textContent || ""
        )
      ).slice(0, 40),
      inputs: main.querySelectorAll("input, select, textarea").length,
      forms: main.querySelectorAll("form").length,
      tables: main.querySelectorAll("table, [role=table]").length,
      links: main.querySelectorAll("a[href]").length,
      textLength: (main.textContent ?? "").trim().length,
    };
  });

const captureScreen = async (
  ctx: BrowserContext,
  mobileCtx: BrowserContext,
  s: Screen,
  ids: Ids
): Promise<Result> => {
  const url = BASE_URL + s.path(ids);
  const apiErrors: string[] = [];
  const consoleErrors: string[] = [];
  const shots: Shot[] = [];
  const watch = (page: Page) => {
    page.on("response", (r) => {
      if (r.url().startsWith(API_URL) && r.status() >= 400)
        apiErrors.push(
          `${r.request().method()} ${new URL(r.url()).pathname} -> ${r.status()}`
        );
    });
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
    });
  };
  const page = await ctx.newPage();
  watch(page);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await settle(page);
  const finalUrl = page.url();
  const redirected = new URL(finalUrl).pathname !== new URL(url).pathname;
  const dom = await domSummary(page);
  shots.push(
    await snap(
      page,
      s,
      "desktop",
      "Viewport desktop 1440×900",
      "desktop",
      false
    )
  );
  shots.push(
    await snap(page, s, "desktop-full", "Toàn trang desktop", "desktop", true)
  );
  await page.close();

  for (const st of s.states ?? []) {
    const p = await (st.mobile ? mobileCtx : ctx).newPage();
    watch(p);
    try {
      await p.goto(url, { waitUntil: "domcontentloaded" });
      await settle(p);
      await st.run?.(p);
      await settle(p);
      shots.push(
        await snap(
          p,
          s,
          st.name,
          st.label,
          st.mobile ? "mobile" : "desktop",
          st.fullPage ?? false
        )
      );
    } catch (e) {
      shots.push({
        file: path.join(folderFor(s), fileFor(s, st.name)),
        state: st.name,
        label: st.label,
        viewport: st.mobile ? "mobile" : "desktop",
        fullPage: false,
        bytes: 0,
        ok: false,
        error: String(e).split("\n")[0].slice(0, 200),
      });
    }
    await p.close();
  }

  if (s.mobile) {
    const p = await mobileCtx.newPage();
    watch(p);
    await p.goto(url, { waitUntil: "domcontentloaded" });
    await settle(p);
    shots.push(
      await snap(p, s, "mobile", "Viewport mobile 390×844", "mobile", false)
    );
    shots.push(
      await snap(p, s, "mobile-full", "Toàn trang mobile", "mobile", true)
    );
    await p.close();
  }

  const failed = shots.filter((x) => !x.ok).length;
  const status =
    s.expectRedirect && redirected
      ? "REDIRECT_AS_EXPECTED"
      : redirected
        ? "UNEXPECTED_REDIRECT"
        : failed === shots.length
          ? "FAILED"
          : failed > 0
            ? "PARTIAL"
            : "OK";
  const { path: _p, states, ...meta } = s;
  return {
    screen: { ...meta, states: (states ?? []).map((x) => x.name) },
    url: url.replace(BASE_URL, ""),
    finalUrl: finalUrl.replace(BASE_URL, ""),
    redirected,
    status,
    shots,
    apiErrors: [...new Set(apiErrors)],
    consoleErrors: [...new Set(consoleErrors)].slice(0, 8),
    dom,
  };
};

// --------------------------------------------------------- design system ----
// Element-level crops of real rendered components, then one contact sheet.
const DS_PARTS: Array<{
  actor: Actor;
  path: string;
  selector: string;
  name: string;
  label: string;
  before?: (p: Page) => Promise<void>;
}> = [
  {
    actor: "guest",
    path: "/jobs",
    selector: "header",
    name: "navbar-guest",
    label: "Navbar — khách",
  },
  {
    actor: "talent",
    path: "/jobs",
    selector: "header",
    name: "navbar-talent",
    label: "Navbar — ứng viên đã đăng nhập",
  },
  {
    actor: "guest",
    path: "/jobs",
    selector: "main aside",
    name: "filter-sidebar",
    label: "Sidebar bộ lọc (FilterGroup, CheckRow)",
  },
  {
    actor: "guest",
    path: "/jobs",
    selector: 'main a[href^="/jobs/"]',
    name: "job-card",
    label: "JobCard (badge, SalaryBadge, CompanyLogo)",
  },
  {
    actor: "guest",
    path: "/login",
    selector: "form",
    name: "form-validation",
    label: "Form + FieldError (zod)",
    before: submitEmpty(),
  },
  {
    actor: "guest",
    path: "/register",
    selector: "form",
    name: "form-register",
    label: "Form đăng ký — input, PillToggle, Button primary",
  },
  {
    actor: "talent",
    path: "/talent",
    selector: '[role="tablist"]',
    name: "tabs",
    label: "Tabs (segmented) có bộ đếm",
  },
  {
    actor: "talent",
    path: "/settings",
    selector: "#notifications",
    name: "toggle-rows",
    label: "ToggleRow / Switch",
  },
  {
    actor: "talent",
    path: "/settings",
    selector: "#danger",
    name: "danger-zone",
    label: "Button danger / outline",
  },
  {
    actor: "talent",
    path: "/saved",
    selector: "main",
    name: "empty-state",
    label: "EmptyState",
  },
  {
    actor: "admin",
    path: "/admin?tab=users",
    selector: "main nav, main aside",
    name: "admin-nav",
    label: "Menu mục (icon lucide-react, aria-current)",
  },
  {
    actor: "employer",
    path: "/employer-dashboard/team",
    selector: "main form",
    name: "invite-form",
    label: "Select + RoleBadge (form mời thành viên)",
  },
];

const captureDesignSystem = async (
  browser: Browser,
  sessions: Partial<
    Record<
      Actor,
      { storage: Awaited<ReturnType<BrowserContext["storageState"]>> }
    >
  >
) => {
  const dir = path.join(OUT_DIR, "design-system");
  mkdirSync(dir, { recursive: true });
  const made: Array<{ file: string; label: string }> = [];
  for (const part of DS_PARTS) {
    const storageState =
      part.actor === "guest" ? undefined : sessions[part.actor]?.storage;
    if (part.actor !== "guest" && !storageState) continue;
    const ctx = await browser.newContext({
      viewport: DESKTOP,
      locale: LOCALE,
      storageState,
      deviceScaleFactor: 2,
    });
    await throttleApi(ctx);
    const p = await ctx.newPage();
    try {
      await p.goto(BASE_URL + part.path, { waitUntil: "domcontentloaded" });
      await settle(p);
      await part.before?.(p);
      const el = p.locator(part.selector).first();
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({
        path: path.join(dir, `${part.name}.png`),
        animations: "disabled",
        mask: maskFor(p),
      });
      made.push({ file: `${part.name}.png`, label: part.label });
      console.log(`design-system: ${part.name} ok`);
    } catch (e) {
      console.log(
        `design-system: ${part.name} FAILED ${String(e).split("\n")[0].slice(0, 120)}`
      );
    }
    await ctx.close();
  }
  // Contact sheet: the crops above + swatches read from the live CSS variables.
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const p = await ctx.newPage();
  await p.goto(BASE_URL + "/");
  const vars = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return [
      "--bg",
      "--bg-card",
      "--bg-inset",
      "--border-strong",
      "--fg",
      "--fg-muted",
      "--fg-subtle",
      "--brand",
      "--brand-hover",
      "--salary-bg",
      "--salary-fg",
    ].map((v) => [v, cs.getPropertyValue(v).trim()]);
  });
  const { readFileSync } = await import("node:fs");
  const tiles = made
    .map(
      (m) =>
        `<figure><img src="data:image/png;base64,${readFileSync(path.join(dir, m.file)).toString("base64")}"><figcaption>${m.label}</figcaption></figure>`
    )
    .join("");
  const swatches = vars
    .map(
      ([k, v]) =>
        `<div class="sw"><i style="background:${v}"></i><b>${k}</b><span>${v}</span></div>`
    )
    .join("");
  await p.setContent(`<!doctype html><html><head><style>
    body{margin:0;padding:32px;background:#f8f7f4;font:14px Inter,system-ui,sans-serif;color:#1a1917}
    h1{font-size:24px;margin:0 0 4px}p{color:#5c5954;margin:0 0 20px}
    .sws{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px}.sw{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #ddd9d1;border-radius:10px;padding:6px 10px;font-size:12px}
    .sw i{width:22px;height:22px;border-radius:6px;border:1px solid #ddd9d1}.sw span{color:#757069}
    .grid{columns:3;column-gap:16px}figure{break-inside:avoid;margin:0 0 16px;background:#fff;border:1px solid #ddd9d1;border-radius:14px;padding:12px}
    figure img{max-width:100%;display:block;border-radius:8px}figcaption{font-size:12px;color:#5c5954;margin-top:8px}
  </style></head><body><h1>RemoteSEA — thành phần UI thực tế</h1><p>Cắt từ ứng dụng đang chạy (${BASE_URL}), ${new Date().toISOString().slice(0, 10)}. Swatch đọc từ CSS variables trên :root.</p>
  <div class="sws">${swatches}</div><div class="grid">${tiles}</div></body></html>`);
  await p.waitForTimeout(300);
  await p.screenshot({
    path: path.join(dir, "components-overview.png"),
    fullPage: true,
  });
  await ctx.close();
  console.log(`design-system: components-overview.png (${made.length} parts)`);
};

// --------------------------------------------------------------- AI chat ----
// The widget only renders when VITE_ENABLE_AI_CHAT=true (RootLayout.tsx), and
// the local .env does not set it. Rather than editing .env, run a second dev
// server with the flag in its process env (Vite gives process env priority):
//   VITE_ENABLE_AI_CHAT=true npx vite --port 3002 --strictPort
// The API's CORS allowlist only contains FRONTEND_URL (:3001), so API calls
// from :3002 are forwarded by Playwright with that origin. Auth is untouched;
// no message is sent (that would call the LLM and persist a conversation).
const AI_BASE_URL = process.env.CAPTURE_AI_BASE_URL ?? "http://localhost:3002";
const captureAiChat = async (
  browser: Browser,
  sessions: Partial<
    Record<
      Actor,
      { storage: Awaited<ReturnType<BrowserContext["storageState"]>> }
    >
  >
) => {
  const results: Result[] = [];
  for (const actor of ["talent", "employer"] as const) {
    const s: Screen = {
      id: `S4-AI-CHAT-${actor.toUpperCase()}`,
      sprint: 4,
      pbs: ["PB94", "PB95", "PB96"],
      actor,
      feature: "ai-chat",
      screen: "assistant-widget",
      title: `Trợ lý AI (widget) — ${actor === "talent" ? "ứng viên" : "nhà tuyển dụng"}`,
      route: "(widget toàn cục, VITE_ENABLE_AI_CHAT=true)",
      path: () => (actor === "talent" ? "/talent" : "/employer-dashboard"),
    };
    const storage = sessions[actor]?.storage;
    if (!storage) continue;
    // Same token, other origin: copy :3001's localStorage onto :3002.
    const origin = new URL(AI_BASE_URL).origin;
    const storageState = {
      cookies: storage.cookies,
      origins: storage.origins.map((o) => ({ ...o, origin })),
    };
    const shots: Shot[] = [];
    const apiErrors: string[] = [];
    for (const vp of ["desktop", "mobile"] as const) {
      const ctx = await browser.newContext({
        viewport: vp === "desktop" ? DESKTOP : MOBILE,
        locale: LOCALE,
        storageState,
        ...(vp === "mobile"
          ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
          : {}),
      });
      await ctx.route(`${API_URL}/**`, async (route) => {
        const req = route.request();
        const cors = {
          "access-control-allow-origin": origin,
          "access-control-allow-credentials": "true",
          "access-control-allow-headers":
            req.headers()["access-control-request-headers"] ?? "*",
          "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
        };
        if (req.method() === "OPTIONS")
          return route.fulfill({ status: 204, headers: cors });
        if (req.method() !== "GET") return route.abort(); // read-only
        const res = await route.fetch({
          headers: { ...req.headers(), origin: BASE_URL },
        });
        if (res.status() >= 400)
          apiErrors.push(
            `GET ${new URL(req.url()).pathname} -> ${res.status()}`
          );
        return route.fulfill({
          response: res,
          headers: { ...res.headers(), ...cors },
        });
      });
      const p = await ctx.newPage();
      await p.goto(AI_BASE_URL + s.path({} as Ids), {
        waitUntil: "domcontentloaded",
      });
      await settle(p);
      const launcher = p.getByRole("button", {
        name: /open ai assistant|trợ lý ai/i,
      });
      if (!(await launcher.isVisible().catch(() => false))) {
        shots.push({
          file: path.join(folderFor(s), fileFor(s, `${vp}-launcher`)),
          state: `${vp}-launcher`,
          label: "Nút mở trợ lý AI",
          viewport: vp,
          fullPage: false,
          bytes: 0,
          ok: false,
          error: "launcher not rendered (flag off on this server?)",
        });
        await ctx.close();
        continue;
      }
      shots.push(
        await snap(
          p,
          s,
          `${vp}-launcher`,
          "Nút mở trợ lý AI (góc dưới phải)",
          vp,
          false
        )
      );
      await launcher.click();
      await p.waitForTimeout(600);
      await settle(p);
      shots.push(
        await snap(
          p,
          s,
          `${vp}-open`,
          "Mở khung chat (ô nhập, gợi ý)",
          vp,
          false
        )
      );
      const hist = p
        .getByRole("button", { name: /conversation history|lịch sử/i })
        .first();
      if (await hist.isVisible().catch(() => false)) {
        await hist.click();
        await p.waitForTimeout(500);
        shots.push(
          await snap(
            p,
            s,
            `${vp}-history`,
            "Menu lịch sử hội thoại (PB96)",
            vp,
            false
          )
        );
      }
      await ctx.close();
    }
    const { path: _p, states, ...meta } = s;
    results.push({
      screen: { ...meta, states: [] },
      url: `${AI_BASE_URL}${s.path({} as Ids)}`,
      finalUrl: "",
      redirected: false,
      status:
        shots.every((x) => x.ok) && shots.length
          ? "OK"
          : shots.some((x) => x.ok)
            ? "PARTIAL"
            : "FAILED",
      shots,
      apiErrors: [...new Set(apiErrors)],
      consoleErrors: [],
    });
    console.log(
      `ai-chat ${actor}: ${shots.filter((x) => x.ok).length}/${shots.length}`
    );
  }
  writeFileSync(
    path.join(OUT_DIR, "capture-results.ai-chat.json"),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), baseUrl: AI_BASE_URL, results },
      null,
      2
    )
  );
};

// ------------------------------------------------------------------ main ----
const main = async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const actors: Actor[] = ["guest", "talent", "employer", "admin"];
  const sessions: Partial<
    Record<Actor, Awaited<ReturnType<typeof loginViaUi>>>
  > = {};
  const blocked: Partial<Record<Actor, string>> = {};
  for (const a of actors) {
    if (a === "guest") continue;
    if (!PASSWORD) {
      blocked[a] = "BLOCKED_AUTH: CAPTURE_PASSWORD not set";
      continue;
    }
    try {
      sessions[a] = await loginViaUi(browser, a);
      console.log(`login ok: ${a}`);
    } catch (e) {
      blocked[a] = `BLOCKED_AUTH: ${String(e).split("\n")[0]}`;
      console.log(`login failed: ${a}`);
    }
  }
  if (args["design-system"] || args["ai-chat"]) {
    if (args["design-system"]) await captureDesignSystem(browser, sessions);
    if (args["ai-chat"]) await captureAiChat(browser, sessions);
    await browser.close();
    return;
  }
  const ids = await resolveIds(
    Object.fromEntries(Object.entries(sessions).map(([k, v]) => [k, v!.token]))
  );
  console.log(
    "ids resolved:",
    Object.entries(ids)
      .map(([k, v]) => `${k}=${v ? "ok" : "MISSING"}`)
      .join(" ")
  );

  const results: Result[] = [];
  for (const a of actors) {
    const list = SCREENS.filter(
      (s) =>
        s.actor === a &&
        (!ONLY ||
          ONLY.some((o) => s.pbs.includes(o) || s.id === o || s.feature === o))
    );
    if (!list.length) continue;
    if (blocked[a]) {
      for (const s of list) {
        const { path: _p, states, ...meta } = s;
        results.push({
          screen: { ...meta, states: (states ?? []).map((x) => x.name) },
          url: s.route,
          finalUrl: "",
          redirected: false,
          status: "BLOCKED_AUTH",
          shots: [],
          apiErrors: [],
          consoleErrors: [blocked[a]!],
        });
      }
      continue;
    }
    let ctx!: BrowserContext;
    let mctx!: BrowserContext;
    const openContexts = async () => {
      const storageState = sessions[a as Exclude<Actor, "guest">]?.storage;
      ctx = await browser.newContext({
        viewport: DESKTOP,
        locale: LOCALE,
        storageState,
      });
      mctx = await browser.newContext({
        viewport: MOBILE,
        locale: LOCALE,
        storageState,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
      await throttleApi(ctx);
      await throttleApi(mctx);
    };
    await openContexts();
    // A transient API/DB failure while validating the session comes back as a
    // 401, which makes the app drop its token — every later page in that
    // context would then render logged-out. Log in again and retry once.
    const needsRetry = (r: Result) =>
      (r.screen.actor !== "guest" &&
        !r.screen.expectRedirect &&
        r.finalUrl.startsWith("/login")) ||
      r.apiErrors.some((x) => / -> 401$/.test(x));
    for (const s of list) {
      process.stdout.write(`[${a}] ${s.id} ... `);
      try {
        let r = await captureScreen(ctx, mctx, s, ids);
        if (needsRetry(r)) {
          process.stdout.write(
            `retry (${r.apiErrors.slice(0, 2).join(", ") || r.finalUrl}) ... `
          );
          if (a !== "guest") {
            await ctx.close();
            await mctx.close();
            sessions[a as Exclude<Actor, "guest">] = await loginViaUi(
              browser,
              a as Exclude<Actor, "guest">
            );
            await openContexts();
          }
          r = await captureScreen(ctx, mctx, s, ids);
          r.retried = true;
        }
        results.push(r);
        console.log(
          `${r.status} (${r.shots.filter((x) => x.ok).length}/${r.shots.length} shots)`
        );
      } catch (e) {
        console.log(`ERROR ${String(e).split("\n")[0]}`);
        const { path: _p, states, ...meta } = s;
        results.push({
          screen: { ...meta, states: (states ?? []).map((x) => x.name) },
          url: s.route,
          finalUrl: "",
          redirected: false,
          status: "FAILED",
          shots: [],
          apiErrors: [],
          consoleErrors: [String(e).split("\n")[0].slice(0, 200)],
        });
      }
    }
    await ctx.close();
    await mctx.close();
  }
  await browser.close();

  const out = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    apiConcurrencyCap: API_CONCURRENCY,
    locale: LOCALE,
    viewports: { desktop: DESKTOP, mobile: MOBILE },
    accounts: Object.fromEntries(
      Object.entries(ACCOUNTS).map(([k, v]) => [k, v])
    ),
    blocked,
    idsResolved: Object.fromEntries(
      Object.entries(ids).map(([k, v]) => [k, !!v])
    ),
    results,
  };
  mkdirSync(OUT_DIR, { recursive: true });
  const target = path.join(OUT_DIR, "capture-results.json");
  if (ONLY && existsSync(target)) {
    // Partial re-run: replace only the re-captured screens in the full result.
    const prev = JSON.parse(readFileSync(target, "utf8"));
    const fresh = new Map(results.map((r) => [r.screen.id, r]));
    const kept = prev.results.map((r: Result) => fresh.get(r.screen.id) ?? r);
    for (const r of results)
      if (!prev.results.some((p: Result) => p.screen.id === r.screen.id))
        kept.push(r);
    out.results = kept;
    out.generatedAt = prev.generatedAt;
    (out as Record<string, unknown>).partialRerunAt = new Date().toISOString();
  }
  writeFileSync(target, JSON.stringify(out, null, 2));
  const ok = results.flatMap((r) => r.shots).filter((s) => s.ok).length;
  console.log(
    `\n${results.length} screens, ${ok} screenshots written to ${path.relative(ROOT, SHOT_DIR)}`
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
