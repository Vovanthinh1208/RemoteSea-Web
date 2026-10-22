# USER INTERFACE DESIGN — bộ bằng chứng giao diện RemoteSEA Web

Thư mục này chứa ảnh chụp giao diện **thực tế** của `remotesea-web` (chạy trên dev server, gọi `remotesea-api` thật) cùng tài liệu đối chiếu với Product Backlog, phục vụ viết chương **USER INTERFACE DESIGN** của báo cáo đồ án.

## Mục tiêu và phạm vi

- Nguồn đối chiếu: `docs/PRODUCT_BACKLOG_OFFICIAL.md` (thư mục gốc dự án) — **4 Sprint, 96 PB** (S1: PB01–PB22 · S2: PB23–PB48 · S3: PB49–PB74 · S4: PB75–PB96). Đã trích actor, mô tả và Acceptance Criteria của cả 96 PB vào `data/product-backlog.json`.
- Phạm vi UI: **35 route + catch-all 404** trong `src/router/AppRouter.tsx`, widget Trợ lý AI toàn cục, các trạng thái giao diện (validation, empty, error, loading, dropdown, dialog, tab, mobile).
- Actor: Khách, Ứng viên (`talent1@remotesea.dev`), Nhà tuyển dụng (`employer1@remotesea.dev`), Admin (`admin@remotesea.dev`) — tài khoản seed của `remotesea-api/prisma/seed.ts`, đăng nhập qua form `/login`. Sprint 1 dùng thêm tài khoản dùng một lần cho các luồng có ghi dữ liệu (xem `sprint-01/README.md`).
- Viewport: desktop 1440×900, mobile 390×844 (DPR 2). Locale: `en-US` (riêng tài khoản Admin hiển thị tiếng Việt do tuỳ chọn ngôn ngữ của tài khoản).

## Tổng kết theo Sprint

<!-- SUMMARY:START -->

(chạy `node scripts/build-ui-design-docs.mjs` để điền bảng)
<!-- SUMMARY:END -->

## Cấu trúc thư mục

| Đường dẫn                                        | Nội dung                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [`sprint-ui-mapping.md`](sprint-ui-mapping.md)   | Sprint → PB → User Story → Actor → Route → Screen → Screenshot                                    |
| [`ui-coverage-matrix.md`](ui-coverage-matrix.md) | Acceptance Criteria ↔ route ↔ ảnh ↔ kết quả runtime ↔ trạng thái, cho 96 PB                       |
| [`ui-inventory.csv`](ui-inventory.csv)           | Mỗi ảnh một dòng (UTF-8 BOM, mở được bằng Excel/Sheets)                                           |
| [`screen-catalog.md`](screen-catalog.md)         | Mô tả từng màn hình: mục đích, bố cục, hành vi, bằng chứng                                        |
| [`design-system.md`](design-system.md)           | Màu, typography, spacing, radius, shadow, component — giá trị lấy từ source                       |
| [`route-audit.md`](route-audit.md)               | 36 route: component, guard, Sprint, PB, điều hướng, API, kết quả runtime; phân tích feature flags |
| [`issues-and-gaps.md`](issues-and-gaps.md)       | Lỗi API ảnh hưởng UI, màn hình bị chặn, khác biệt Backlog ↔ implementation                        |
| [`ui-chapter-outline.md`](ui-chapter-outline.md) | Đề cương chương USER INTERFACE DESIGN (mục 13.1–13.11) dựa trên bằng chứng                        |
| [`screenshots/`](screenshots/README.md)          | Ảnh toàn ứng dụng theo `sprint-0N/` và `shared/` (+ danh mục)                                     |
| [`sprint-01/`](sprint-01/README.md)              | Bộ ảnh chi tiết Sprint 1 theo từng PB (PB01–PB22), gallery riêng                                  |
| [`gallery/index.html`](gallery/index.html)       | Thư viện ảnh toàn ứng dụng: lọc Sprint / actor / viewport, tìm theo PB hoặc tên màn hình          |
| [`design-system/`](design-system/)               | Ảnh thành phần UI cắt từ ứng dụng thật + ảnh tổng hợp                                             |
| `evidence/`                                      | Ảnh bằng chứng lỗi (ví dụ đăng xuất cưỡng bức do API 401)                                         |
| `data/`                                          | Dữ liệu nguồn: backlog đã trích, route, ghi chú màn hình, đánh giá thủ công từng PB               |
| `capture-results*.json`                          | Kết quả máy đọc được của các lần chụp (không chứa mật khẩu/token)                                 |

## Đọc trạng thái xác minh

| Trạng thái                         | Ý nghĩa                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `CAPTURED_AND_VERIFIED`            | Đã chụp và đã tương tác/kiểm tra giao diện runtime (mở form, validation, tab, dialog, kết quả điều hướng…) |
| `CAPTURED_NOT_INTERACTION_TESTED`  | Đã chụp, thấy đủ thành phần, nhưng **không** thao tác (thường vì thao tác sẽ ghi vào tài khoản seed)       |
| `PARTIALLY_CAPTURED`               | Chỉ một phần màn hình/luồng chụp được                                                                      |
| `BLOCKED_AUTH` / `BLOCKED_API`     | Bị chặn do thiếu tài khoản/quyền, hoặc API lỗi làm màn hình không hiển thị                                 |
| `IMPLEMENTED_BUT_UNMAPPED`         | Có giao diện nhưng không có PB tương ứng                                                                   |
| `NOT_IMPLEMENTED` / `NOT_VERIFIED` | Chưa triển khai / chưa đủ bằng chứng (gồm PB nền không có UI: PB44, PB46, PB78, PB81)                      |

**Đã chụp ≠ đã kiểm thử chức năng.** Kết quả kiểm thử nằm trong `docs/SPRINT1/2/3_TEST_REPORT.md` ở thư mục gốc dự án.

## Mở thư viện ảnh

Mở `docs/ui-design/gallery/index.html` (toàn ứng dụng) hoặc `docs/ui-design/sprint-01/gallery/index.html` (Sprint 1) bằng trình duyệt. Đường dẫn ảnh là tương đối. Nếu trình duyệt chặn `file://`: `npx serve docs/ui-design` rồi mở `/gallery/`.

## Chạy lại quy trình

```bash
cd remotesea-web          # cần remotesea-api :4000 và web dev server :3001 đang chạy
export CAPTURE_PASSWORD=<mật khẩu tài khoản seed>

node scripts/capture-ui-screenshots.ts                 # toàn ứng dụng → screenshots/, capture-results.json
node scripts/capture-ui-screenshots.ts --only=S2-JOBS  # chụp lại một màn hình (gộp vào kết quả cũ)
node scripts/capture-ui-screenshots.ts --design-system # design-system/*.png
# Trợ lý AI (PB94–96): dev server thứ hai bật cờ, .env không đổi
#   VITE_ENABLE_AI_CHAT=true npx vite --port 3002 --strictPort   (xem issues-and-gaps.md B1)
node scripts/capture-ui-screenshots.ts --ai-chat

CAPTURE_API_CONCURRENCY=2 node scripts/capture-sprint-01-ui.ts   # Sprint 1 chi tiết (sprint-01/)

node scripts/build-ui-design-docs.mjs     # CSV, mapping, coverage, catalog, route audit, gallery, bảng tổng kết
node scripts/build-sprint-01-docs.mjs     # tài liệu sprint-01/
```

Không cài thêm dependency: dùng `@playwright/test` có sẵn + Chrome hệ thống; Node ≥ 22.6 chạy TypeScript trực tiếp.

## Hạn chế còn tồn tại

Tóm tắt — chi tiết trong [`issues-and-gaps.md`](issues-and-gaps.md):

- API dùng CSDL Supabase được cấu hình sẵn; khi nhận nhiều request đồng thời trả 401/500 rải rác → script giới hạn số request đồng thời (`CAPTURE_API_CONCURRENCY`) để chụp được giao diện đúng.
- Dashboard ứng viên và nhà tuyển dụng, tìm việc theo từ khoá đang lỗi 500 → các PB phụ thuộc bị `BLOCKED_API` / `PARTIALLY_CAPTURED`.
- Không thực hiện thao tác ghi trên tài khoản seed (ứng tuyển, gửi tin, chấm scorecard, duyệt tin, khoá user…); không thanh toán Stripe, không OAuth thật.
- Ảnh chụp từ dev server với các thay đổi i18n chưa commit trong working tree tại thời điểm chụp.
