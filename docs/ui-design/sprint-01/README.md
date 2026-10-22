# Sprint 1 — Bộ ảnh giao diện (PB01–PB22)

Bằng chứng giao diện cho Sprint 1 của RemoteSEA Web, dùng để viết chương **USER INTERFACE DESIGN**. Toàn bộ ảnh chụp từ ứng dụng chạy thật (`remotesea-web` dev server + `remotesea-api`), không vẽ lại, không mock.

## Phạm vi

- **Sprint 1 — Nền tảng hệ thống, Xác thực & Danh mục chuẩn**, PB01–PB22 theo `docs/PRODUCT_BACKLOG_OFFICIAL.md` §2.3 (thư mục gốc dự án).
- Nhóm tính năng: xác thực (PB01–PB09), bảo mật & tài khoản (PB10–PB20), hồ sơ ứng viên & xác minh email (PB21–PB22).
- Actor xuất hiện trong Sprint 1: **Khách**, **Ứng viên (TALENT)**, **Nhà tuyển dụng (EMPLOYER)**. Admin không có PB riêng trong Sprint 1 (chỉ dùng chung PB02/PB09).
- Cấu hình Sprint: `.env` local đặt `VITE_SPRINT_FOCUS=all`, `VITE_VISIBLE_SPRINTS=all`, `VITE_ENABLE_SPRINT_BOARD=true` → mọi route Sprint 1 truy cập được, **không cần sửa cấu hình**. Phân tích chi tiết ba biến: `../route-audit.md` §2.

## Cách đọc bộ tài liệu

| File                                                           | Nội dung                                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [`sprint-01-ui-capture-plan.md`](sprint-01-ui-capture-plan.md) | Bảng PB → tên chính thức → actor → tính năng → route → màn hình cần chụp → trạng thái                               |
| [`sprint-01-screen-catalog.md`](sprint-01-screen-catalog.md)   | Từng PB: mục đích, bố cục, tương tác đã xác minh, điều kiện truy cập, khác biệt với AC, bảng ảnh + kết quả kiểm tra |
| [`sprint-01-pb-coverage.md`](sprint-01-pb-coverage.md)         | Đối chiếu Acceptance Criteria ↔ route ↔ số màn hình ↔ số ảnh ↔ UI verified                                          |
| [`sprint-01-capture-report.md`](sprint-01-capture-report.md)   | Số liệu lần chụp, entry lỗi, kiểm tra không đạt, lỗi API, dọn dẹp tài khoản test                                    |
| [`gallery/index.html`](gallery/index.html)                     | Thư viện ảnh nhóm theo PB, tìm kiếm / lọc actor / viewport                                                          |
| `screenshots/PBxx/`                                            | Ảnh PNG theo PB                                                                                                     |
| `capture-results.json`                                         | Kết quả máy đọc được của lần chụp (không chứa mật khẩu / token)                                                     |
| `data/pb-notes.json`                                           | Ghi chú viết tay theo PB (nguồn của phần mô tả trong catalog)                                                       |

**Mở gallery:** mở file `docs/ui-design/sprint-01/gallery/index.html` bằng trình duyệt (đường dẫn ảnh là tương đối, không cần server). Nếu trình duyệt chặn `file://`, chạy `npx serve docs/ui-design` rồi mở `/sprint-01/gallery/`.

## Quy ước tên ảnh

`PBxx-<actor>-<feature>-<state>[-fullpage].png`, đặt trong `screenshots/PBxx/` của **PB chính**. Ví dụ: `PB10-talent-2fa-setup-setup-qr.png`, `PB01-guest-register-validation-empty.png`. Một ảnh phục vụ nhiều PB được liệt kê ở mọi PB liên quan trong catalog/gallery (cột "PB chính"). Desktop 1440×900, mobile 390×844 (DPR 2).

## Trạng thái xác minh

| Ký hiệu         | Ý nghĩa                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| ✅ VERIFIED     | Đã chụp **và** mọi kiểm tra khai báo trong manifest (URL cuối, nội dung hiển thị, token, file tải về…) đều đạt       |
| 🟡 CAPTURED     | Đã chụp, entry không khai báo kiểm tra tự động (đã xem ảnh thủ công)                                                 |
| ⚠️ CHECK_FAILED | Đã chụp nhưng kiểm tra không đạt — thường là **khác biệt thật** giữa AC và implementation (giải thích trong catalog) |
| ❌ FAILED       | Không chụp được; có ảnh `-FAILED` nếu trang đã mở                                                                    |

Trạng thái theo PB dùng bộ chuẩn của `../ui-coverage-matrix.md`: `CAPTURED_AND_VERIFIED`, `CAPTURED_NOT_INTERACTION_TESTED`, `PARTIALLY_CAPTURED`, `BLOCKED_AUTH`, `BLOCKED_API`, `NOT_VERIFIED`…

**Đã chụp ≠ đã kiểm thử chức năng.** Kết quả kiểm thử Sprint 1 nằm trong `docs/SPRINT1_TEST_REPORT.md` (thư mục gốc dự án).

## Dữ liệu và an toàn

- Tài khoản seed (`talent1@remotesea.dev`…) chỉ được **xem**.
- Mọi thao tác ghi (đăng ký, đổi mật khẩu, bật/tắt 2FA, tạm dừng, xoá tài khoản…) chạy trên **hai tài khoản dùng một lần** do script tự đăng ký (`e2e-ui-s1-<run>-talent@example.com`, `…-employer@example.com`) và **tự xoá ở cuối** (qua UI — PB20; nếu thất bại thì qua `DELETE /users/me`). Kết quả dọn dẹp ghi trong `sprint-01-capture-report.md`.
- Mật khẩu tài khoản dùng một lần sinh ngẫu nhiên mỗi lần chạy, không ghi ra đĩa. Mã QR, khoá 2FA, mã dự phòng và địa chỉ IP trong danh sách phiên **được che** trong ảnh.
- Không thanh toán, không đăng nhập nhà cung cấp OAuth thật; email duy nhất có thể phát sinh là tới địa chỉ `@example.com`.

## Chạy lại

```bash
cd remotesea-web
# API (:4000) và web dev server (:3001) phải đang chạy
CAPTURE_PASSWORD=<mật khẩu tài khoản seed> CAPTURE_API_CONCURRENCY=2 node scripts/capture-sprint-01-ui.ts
node scripts/build-sprint-01-docs.mjs
```

Danh sách màn hình/trạng thái nằm trong manifest `scripts/manifests/sprint-01.json` (thêm entry = thêm ảnh). `--only=PB06,PB07` chạy lại entry khách/seed của các PB đó (chuỗi tài khoản dùng một lần luôn chạy trọn vẹn; thêm `--no-disposable` để bỏ qua chuỗi này).

## Màn hình còn thiếu

Xem mục "Còn thiếu" trong [`sprint-01-capture-report.md`](sprint-01-capture-report.md) và cột _Chưa xác minh_ trong catalog.
