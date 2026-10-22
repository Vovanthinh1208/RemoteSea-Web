# Đề cương chương USER INTERFACE DESIGN — RemoteSEA

Đề cương này dựa **hoàn toàn** trên bằng chứng trong thư mục `docs/ui-design/` (ảnh chụp runtime, source code, Product Backlog). Mỗi mục ghi rõ nên lấy nội dung/ảnh ở đâu. Không đưa vào báo cáo những gì bộ bằng chứng không chứng minh được (xem "Lưu ý viết" cuối mỗi mục).

Quy ước trích dẫn ảnh trong báo cáo: _Hình X.Y — <Tên màn hình> (<PB>, <actor>, <viewport>)_, nguồn file trong `screenshots/sprint-0N/`.

---

## 1. Introduction

- Mục tiêu chương: trình bày thiết kế giao diện web RemoteSEA — nền tảng tuyển dụng remote cho thị trường Đông Nam Á, kết nối Ứng viên (Talent) và Nhà tuyển dụng (Employer), có phân hệ Quản trị (Admin).
- Phạm vi: ứng dụng `remotesea-web` (React 19 + Vite + Tailwind CSS 3, React Router 7). 35 route + trang 404 (`route-audit.md`). Không bao gồm email template, trang Stripe Checkout (do Stripe lưu trữ), dịch vụ AI chạy nền.
- Phương pháp: đọc Product Backlog (96 PB / 4 Sprint), rà soát route trong `src/router/AppRouter.tsx`, chụp ảnh ứng dụng chạy thật với tài khoản seed cho 4 vai trò, đối chiếu ảnh với Acceptance Criteria.

## 2. UI Design Objectives

Viết từ những gì _implementation thể hiện_, mỗi mục kèm 1 ảnh minh hoạ:

| Mục tiêu               | Bằng chứng trong code / ảnh                                                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nhất quán              | Một bộ token màu/radius/shadow (`tailwind.config.ts`), primitive dùng chung `components/ui/*`, một lớp style input duy nhất (`input-styles.ts`), một vòng focus `shadow-focus` → `design-system.md` §6–8 |
| Dễ sử dụng             | Validation inline ngay dưới trường (ảnh `*-validation-error.png`), trạng thái rỗng có hướng dẫn (ảnh `*-empty-*`), skeleton theo khu vực khi tải                                                         |
| Minh bạch cho ứng viên | Dòng thời gian trạng thái đơn ứng tuyển (S3-APP-DETAIL-*)                                                                                                                                                |
| Responsive             | Ảnh `*-mobile.png` cho các màn hình chính; điểm gãy 640/1024px (`design-system.md` §4)                                                                                                                   |
| Truy cập               | Skip link, focus về `<main>` sau điều hướng, `aria-expanded`/`aria-current`, tôn trọng `prefers-reduced-motion` (`design-system.md` §13)                                                                 |
| Song ngữ               | EN/VI qua `LanguageSwitcher` (ảnh `PB12-…-language-menu.png`)                                                                                                                                            |

_Lưu ý viết:_ không viết "đã kiểm thử khả năng sử dụng với người dùng" — không có bằng chứng.

## 3. User Roles and Navigation Structure

- Vai trò thực tế trong code (`UserRole`): **Guest** (chưa đăng nhập), **TALENT**, **EMPLOYER**, **ADMIN**. Trong EMPLOYER có vai trò nội bộ công ty (OWNER, RECRUITER, HIRING_MANAGER, INTERVIEWER — `team.schemas.ts`, PB35–PB40).
- Cơ chế: `ProtectedRoute` (cần đăng nhập, có thể giới hạn vai trò), `GuestOnlyRoute` (login/register…). Bằng chứng: ảnh `PB08-guest-auth-protected-redirect-*` (khách → /login?callbackUrl) và `PB92-talent-admin-role-guard-*` (ứng viên mở /admin → về trang chủ).
- Navbar theo vai trò: bảng trong `route-audit.md` mục "Điều hướng".
- Sơ đồ đề xuất (vẽ lại trong báo cáo):

```
Guest ──► / · /jobs · /jobs/:id · /companies/:slug · /talent/:slug · /salary · /employer · /blog · /community
   └─► /login · /register · /forgot-password · /reset-password ──(đăng nhập)──┐
                                                                              ▼
TALENT   ► /talent (dashboard) ─► /profile · /saved · /alerts · /notifications · /settings
           /jobs/:id (Apply) ─► /applications/:id ─► /messages · /interview
EMPLOYER ► /employer-dashboard ─► /post-job · /employer-dashboard/talent · /team · /interviews
           /employer-dashboard/applications/:id ─► /applications/:id/messages · /interview
ADMIN    ► /admin?tab=queue|employers|users|reports|revenue|audit-log
```

## 4. Information Architecture

- Sitemap: nhóm route theo khu vực (Công khai · Xác thực · Ứng viên · Nhà tuyển dụng · Dùng chung hai vai trò · Admin) — lấy từ `route-audit.md`.
- Bố cục khung: `RootLayout` = Navbar sticky + `<main>` + Footer; mọi trang dùng chung, không có layout riêng cho dashboard.
- Trạng thái trên URL (chia sẻ/khôi phục được): bộ lọc việc làm, tab Admin, tab ứng tuyển, tab ứng viên.

## 5. Design System

Lấy nguyên từ `design-system.md` (đã có giá trị chính xác từ source): bảng màu brand/neutral/semantic, typography (Inter + Instrument Serif italic), radius, shadow, button/form/card/badge/tabs, icon lucide-react. Ảnh tổng hợp: `design-system/components-overview.png`.

_Lưu ý viết:_ ứng dụng **không có dark mode** (cấu hình có nhưng không dùng).

## 6. Sprint-Based UI Design

Mỗi Sprint một tiểu mục, cấu trúc cố định: **Sprint Goal** (trích `ProjectPlan.md` §4.3) → **bảng PB** (lấy từ `sprint-ui-mapping.md`) → **màn hình tiêu biểu kèm ảnh** → **mô tả mục đích & hành vi** (lấy từ `screen-catalog.md`) → **liên kết AC** (`ui-coverage-matrix.md`).

| Sprint | Goal (rút gọn)                               | Màn hình nên đưa vào báo cáo                                                                                                                                                                                                |
| ------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Nền tảng, xác thực, tài khoản                | Login (+validation), Register (+chọn vai trò), Forgot password, Settings (các mục Security, Connected, Notifications, Privacy, Danger zone), Profile editor, Sign-out dialog                                                |
| 2      | Hồ sơ ứng viên, doanh nghiệp, tin tuyển dụng | Job board (+lọc, rỗng, mobile), Job detail, Talent dashboard, Public talent profile (+private), Company page, Employer dashboard, Post-job wizard, Talent search, Team settings                                             |
| 3      | Ứng tuyển, phỏng vấn, đánh giá, tin nhắn     | Job detail khi đăng nhập (Match Score, form Apply), Application detail (Offer / Interview / Pending), Message thread, Interview page (2 phía), Application workspace (Scorecard, AI CV, ghi chú), Notifications (+dropdown) |
| 4      | AI, cảnh báo, admin                          | Job alerts (+validation), Salary insights, Admin console (6 tab), AI chat widget (nếu chụp được)                                                                                                                            |

_Lưu ý viết:_ trạng thái `PARTIALLY_CAPTURED` / `BLOCKED_*` phải được nêu rõ trong tiểu mục Sprint tương ứng (xem `issues-and-gaps.md`).

## 7. Screen Design by Feature

Theo luồng người dùng thay vì theo Sprint, mỗi luồng 3–5 ảnh liên tiếp:

1. **Tìm việc → Ứng tuyển**: /jobs → lọc → /jobs/:id → Apply (inline) → /applications/:id.
2. **Theo dõi ứng tuyển**: dashboard ứng viên (tab) → chi tiết đơn (timeline) → tin nhắn → lịch phỏng vấn → phản hồi Offer.
3. **Đăng tin**: /employer → /post-job (4 bước, validation theo bước) → Stripe (ngoài phạm vi ảnh) → /post-job/success.
4. **Xử lý ứng viên**: employer dashboard (tab, chọn hàng loạt) → workspace (pipeline, scorecard, AI CV analysis, ghi chú) → đề xuất phỏng vấn.
5. **Quản trị**: hàng đợi kiểm duyệt → nhà tuyển dụng → người dùng (lọc/tìm) → báo cáo vi phạm → nhật ký.

## 8. User Interaction and UI States

Bảng trạng thái với ảnh thật (tên file trong `screenshots/README.md`):

| Trạng thái               | Ảnh tiêu biểu                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validation               | `PB02-…-login-validation-error`, `PB01-…-register-validation-error`, `PB06-…-validation-error`, `PB24`/`PB21-…-add-experience-validation`, `PB76-…-create-validation`, `PB37-…-invite-validation`, `PB41-…-step2-validation` |
| Empty                    | `PB47-…-empty-result`, `PB49-talent-saved-jobs-…`, `PB60-employer-interviews-upcoming-…`                                                                                                                                     |
| Lỗi / không tìm thấy     | `PB28-…-private-profile` (Profile not found), `UNMAPPED-…-not-found`, các trang token không hợp lệ (PB07, PB22, PB32, PB36)                                                                                                  |
| Loading                  | Skeleton theo khu vực (`*Skeleton.tsx`) — chỉ mô tả từ source, không có ảnh chủ đích                                                                                                                                         |
| Menu / dropdown / dialog | `…-language-menu`, `…-bell-dropdown`, `…-mobile-menu`, `PB09-…-confirm-dialog`, `PB20`/`PB12-…-delete-confirm`                                                                                                               |
| Tab                      | `PB26-…-tab-*`, `PB34-…-tab-*`, `PB85…PB93` (Admin)                                                                                                                                                                          |
| Inline form              | `PB53-…-apply-form`, `PB88-…-report-form`, `PB64-…-scorecard-form`                                                                                                                                                           |

_Lưu ý viết:_ trạng thái **success** của hầu hết form không được chụp vì sẽ ghi dữ liệu thật — nói rõ điều này.

## 9. Responsive Design

So sánh từng cặp `*-desktop.png` / `*-mobile.png`. Điểm nên nêu (đã thấy trên ảnh): navbar thu thành nút menu; sidebar lọc việc làm thành nút "Filters" mở/đóng; bố cục 2 cột (auth, job detail, settings) xếp thành 1 cột; panel marketing ở trang đăng nhập/đăng ký bị ẩn trên mobile.

## 10. Traceability to Product Backlog

Đưa bảng rút gọn từ `ui-coverage-matrix.md` (PB → màn hình → ảnh → trạng thái) và bảng tổng kết theo Sprint trong `README.md`. Phân biệt rõ: **đã chụp giao diện** ≠ **đã kiểm thử chức năng**; kết quả chức năng nằm trong `docs/SPRINT1/2/3_TEST_REPORT.md` ở thư mục gốc dự án.

## 11. Summary

Tóm tắt: số route, số màn hình, số ảnh, số PB có giao diện đã chụp, các PB không có giao diện (backend/cron), các PB bị chặn và lý do (lấy số từ `README.md`). Hướng phát triển giao diện: các khoảng trống trong `issues-and-gaps.md`.
