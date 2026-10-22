# Sprint 1 · PB15–PB20 — Ảnh giao diện Cài đặt tài khoản

Ảnh chụp **thực tế** (ứng dụng `remotesea-web` chạy trên dev server, gọi `remotesea-api` thật) cho 6 PB của Sprint 1, phục vụ chương **USER INTERFACE DESIGN**.

| PB   | Tên chính thức (Product Backlog)            | Màn hình thực tế                                             |
| ---- | ------------------------------------------- | ------------------------------------------------------------ |
| PB15 | Cấu hình tùy chọn nhận thông báo            | `/settings` → mục 04 _Notifications_                         |
| PB16 | Tạm dừng hoặc kích hoạt lại tài khoản       | `/settings` → mục 06 _Danger zone_ → _Pause my account_      |
| PB17 | Xuất dữ liệu cá nhân (Export Personal Data) | `/settings` → mục 05 _Privacy & data_ → _Download your data_ |
| PB18 | Quản lý các tài khoản xã hội đã liên kết    | `/settings` → mục 03 _Connected accounts_                    |
| PB19 | Quản lý các phiên đăng nhập đang hoạt động  | `/settings` → mục 02 _Security_ → _Active sessions_          |
| PB20 | Xóa vĩnh viễn tài khoản                     | `/settings` → mục 06 _Danger zone_ → _Delete account_        |

Tên PB lấy từ `docs/PRODUCT_BACKLOG_OFFICIAL.md` §2.1 / §2.3 (thư mục gốc dự án). Cả 6 PB nằm trên **một route** — `src/features/settings/pages/SettingsPage.tsx`, khai báo trong `src/router/AppRouter.tsx` dưới `ProtectedRoute` (mọi vai trò đã đăng nhập; khách bị chuyển tới `/login?callbackUrl=%2Fsettings`). Vào trang qua biểu tượng Settings trên navbar; mỗi PB là một mục có anchor (`#notifications`, `#danger`, `#data`, `#connected`, `#security`) và có mục tương ứng trong menu bên trái (chỉ hiện ở màn hình ≥ 1024px).

Cấu hình Sprint: `.env` local đặt `VITE_SPRINT_FOCUS=all`, `VITE_VISIBLE_SPRINTS=all`; `/settings` thuộc Sprint 1 trong `sprint-routes.ts` nên hiển thị ở mọi cấu hình focus có Sprint 1. Không cần sửa cấu hình. Chi tiết: `../../route-audit.md` §2.

## Cấu trúc

```
pb15-pb20/
├── PB15/ … PB20/          ảnh PNG theo PB
├── README.md              (file này)
├── ui-capture-plan.md     PB → actor → section → route → các màn hình/trạng thái cần chụp
├── screen-catalog.md      ghi chú từng PB theo mẫu báo cáo (mục đích, bố cục, tương tác, luồng, dữ liệu, trạng thái, responsive, AC, bằng chứng, xác minh)
├── coverage-matrix.md     PB → routes → số màn hình → số ảnh → trạng thái
├── capture-report.md      số liệu lần chụp, lỗi, lỗi API, trạng thái mô phỏng, phần còn thiếu
├── capture-results.json   kết quả máy đọc được (không chứa mật khẩu/token)
├── data/pb-notes.json     ghi chú viết tay (nguồn của screen-catalog)
└── gallery/index.html     thư viện ảnh nhóm theo PB
```

**Xem ảnh:** mở `gallery/index.html` bằng trình duyệt (đường dẫn tương đối, không cần server; nếu trình duyệt chặn `file://` thì chạy `npx serve docs/ui-design` và mở `/sprint-01/pb15-pb20/gallery/`).

## Quy ước tên ảnh

`PBxx-<tính-năng>-<trạng-thái>.png`, ví dụ `PB15-notification-preferences-toggle-saved.png`, `PB20-delete-account-confirm-panel.png`. Hậu tố:

- `-desktop` viewport 1440×900 · `-mobile` viewport 390×844 (DPR 2)
- `-section-fullpage` ảnh **toàn bộ mục** của PB (cắt theo section — vì 6 PB chung một trang, ảnh full-page của cả trang chỉ có một bản: `PB15/PB15-account-settings-overview-fullpage.png`, dùng chung cho PB15–PB20)
- `-network-error-simulated` / `-loading-slow-network-simulated`: trạng thái lỗi/đang xử lý **thật của giao diện**, được kích hoạt bằng cách chặn hoặc làm chậm **một** request API trong trình duyệt (không sửa trang, không sửa server).

## Trạng thái xác minh

`CAPTURED_AND_VERIFIED` (đã chụp và đã thao tác/kiểm tra runtime) · `CAPTURED_NOT_INTERACTION_TESTED` · `PARTIALLY_CAPTURED` · `BLOCKED_AUTH` · `BLOCKED_API` · `ROUTE_NOT_FOUND` · `NOT_IMPLEMENTED` · `NOT_VERIFIED`. Trong `screen-catalog.md`, mỗi nhận định có nhãn **[Runtime]** (đã thấy trên ứng dụng chạy) hoặc **[Source]** (chỉ đọc mã nguồn). Ký hiệu từng ảnh: ✅ đạt mọi kiểm tra tự động · 🟡 đã chụp, không có kiểm tra tự động · ⚠️ kiểm tra không đạt · ❌ lỗi.

**Đã chụp ≠ đã kiểm thử chức năng** — kết quả kiểm thử: `docs/SPRINT1_TEST_REPORT.md`.

## Dữ liệu và an toàn

- Mọi ảnh chụp trên **hai tài khoản dùng một lần** do script tự đăng ký (`e2e-ui-s1-<run>-talent@example.com`, `…-employer@example.com`) và **tự xoá ở cuối** (chính luồng PB20). Không dùng tài khoản seed.
- Mật khẩu sinh ngẫu nhiên mỗi lần chạy, không ghi ra đĩa. IP trong danh sách phiên và mọi email ngoài tên miền test được **che** trong ảnh. File JSON xuất dữ liệu (PB17) bị huỷ ngay sau khi tải.
- Điều hướng tới Google/GitHub/LinkedIn bị chặn (chỉ ghi URL đích đã bỏ token `state`); không đăng nhập nhà cung cấp thật.

## Chạy lại

```bash
cd remotesea-web          # cần remotesea-api :4000 và web dev server :3001 đang chạy
CAPTURE_API_CONCURRENCY=2 node scripts/capture-sprint-01-ui.ts --manifest=scripts/manifests/sprint-01-pb15-pb20.json
node scripts/build-pb15-pb20-docs.mjs
```

Danh sách màn hình/trạng thái: `scripts/manifests/sprint-01-pb15-pb20.json` (thêm entry = thêm ảnh). Không cần `CAPTURE_PASSWORD` vì không dùng tài khoản seed. `CAPTURE_API_CONCURRENCY=2` giới hạn request API đồng thời — cần thiết vì API trả 401 sai cho token hợp lệ khi nhận nhiều request cùng lúc (`../../issues-and-gaps.md` A1).

## Màn hình còn thiếu

Xem mục **Còn thiếu** trong [`capture-report.md`](capture-report.md): trạng thái _đã liên kết / ngắt kết nối_ của PB18 (cần OAuth thật — API local chưa cấu hình), ràng buộc _OWNER duy nhất của công ty_ của PB20, lỗi tạm dừng/kích hoạt của PB16.
