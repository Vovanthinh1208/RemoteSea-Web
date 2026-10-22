# Issues & Gaps — kiểm tra UI RemoteSEA Web

Ghi nhận trong quá trình chụp ảnh ngày 2026-10-21 trên `http://localhost:3001` (Vite dev, code đang có thay đổi chưa commit của người dùng) + API `http://localhost:4000` (kết nối CSDL Supabase được cấu hình trong `remotesea-api/.env`). Mỗi mục ghi **bằng chứng** và **mức chắc chắn**. Đây là phát hiện trong phạm vi chụp UI, không thay thế báo cáo kiểm thử.

Mức độ: **Cao** = chặn hoặc làm sai màn hình chính · **TB** = màn hình hiển thị thiếu · **Thấp** = thẩm mỹ / tài liệu.

## A. Lỗi API ảnh hưởng trực tiếp đến giao diện

### A1. API trả 401 cho token hợp lệ khi nhận nhiều request đồng thời → người dùng bị đăng xuất (Cao)

- **Hiện tượng:** mở `/settings` bằng tài khoản ứng viên hợp lệ → bị chuyển về `/login?callbackUrl=%2Fsettings`. Ảnh: [`evidence/defect-settings-401-forced-logout.png`](evidence/defect-settings-401-forced-logout.png).
- **Tái hiện ngoài trình duyệt** (Python, cùng một access token hợp lệ):
  - 8 request GET song song tới `/users/me/connections`, `/users/me/sessions`, `/users/me/pause`, `/auth/2fa/status`, `/users/me/notification-preferences`, `/users/me/account`, `/notifications`, `/auth/session`: **10/10 lượt đều có đúng 2 request trả 401** `{"code":"AUTHENTICATION_REQUIRED"}`, endpoint bị lỗi thay đổi ngẫu nhiên; thỉnh thoảng thêm một 500.
  - Gửi tuần tự đúng 8 request đó: **8/8 trả 200**.
  - 24 request song song: 4 × 401.
- **Vì sao UI bị ảnh hưởng:** web coi mọi 401 là phiên hết hạn và xoá token. Trang Settings gọi ~8 truy vấn cùng lúc khi mở nên gần như luôn dính lỗi.
- **Nguyên nhân:** _chưa xác định._ Phỏng đoán: bước tra session trong `remotesea-api/src/modules/auth/strategies/jwt.strategy.ts` (`findSessionState`) thất bại khi pool kết nối CSDL bị nghẽn và kết quả bị diễn giải thành "không có phiên". Cần đọc log API để khẳng định.
- **Ảnh hưởng tới bộ ảnh:** để chụp được giao diện đúng, script giới hạn **tối đa 3 request API đồng thời mỗi tab** (`CAPTURE_API_CONCURRENCY`, mặc định 3; đặt `0` để tắt và tái hiện lỗi). Script vẫn đăng nhập lại và thử lại một lần nếu vẫn gặp 401. Đây là xử lý trong môi trường chụp, **không** sửa mã ứng dụng hay API.

### A2. `GET /talent/me/dashboard` trả 500 cho tài khoản TALENT (TB)

- Tái hiện bằng curl với `talent1@remotesea.dev` và `candidate.strong@remotesea.dev`: cả hai luôn 500 `INTERNAL_ERROR`. Với EMPLOYER/ADMIN, cùng endpoint lại trả 200 (chưa kiểm tra lý do không chặn theo vai trò).
- Ảnh hưởng: dashboard ứng viên (PB26/PB27) thiếu khối số liệu tổng hợp. Xem ảnh `sprint-02/PB26-talent-talent-dashboard-dashboard-*`.

### A3. `GET /employer/dashboard` trả 500 cho EMPLOYER (TB)

- Tái hiện bằng curl với `employer1@remotesea.dev`: luôn 500.
- Ảnh hưởng: dashboard nhà tuyển dụng (PB34) thiếu khối tổng quan. Xem `sprint-02/PB34-employer-employer-dashboard-dashboard-*`.

> Bổ sung cho A2: **cả trang** `/talent` là trạng thái lỗi "Couldn't load your dashboard / Try again" (không chỉ thiếu một khối) — kể cả với tài khoản ứng viên vừa đăng ký. Hệ quả: banner xác minh email (PB22), bảng đơn ứng tuyển theo tab (PB26/PB54), lượt xem hồ sơ (PB27), lời mời (PB79) và cảnh báo trên dashboard không hiển thị được. Tương tự A3: cả trang `/employer-dashboard` là trạng thái lỗi → panel ứng viên, thao tác hàng loạt (PB57/PB59), danh sách tin (PB45) không chụp được.

### A4. Tìm việc theo từ khoá luôn lỗi: `GET /jobs?q=…` → 500 (Cao)

- `curl /jobs?q=engineer`, `q=react`, `q=a` → **500** mọi lần; `/jobs` không có `q`, hoặc chỉ lọc `jobType`/`seniority`/`timezone` → 200.
- Trên UI: gõ từ khoá ở `/jobs` → "Couldn't load jobs — Something went wrong fetching listings." + "Try again" (ảnh `sprint-02/PB47-guest-jobs-job-board-search-error.png`). Tìm kiếm ứng viên (`GET /talent?q=`) **không** bị lỗi này.
- Ảnh empty state của bảng việc làm vì vậy được chụp bằng bộ lọc không có kết quả (`?tz=AU`), không phải bằng từ khoá.

### A5. 500 rải rác ở nhiều endpoint khi tải đồng thời (TB)

Trong lần chụp toàn bộ (giới hạn 3 request/tab) đã gặp 500 không lặp lại ở: `/categories`, `/jobs`, `/notifications`, `/saved`, `/admin/users`, `/admin/jobs`, `/employer/jobs`, `/talent`. Gọi lại tuần tự thì trả 200. Nhiều khả năng cùng nguyên nhân với A1 (CSDL/pool). Ảnh nào bị ảnh hưởng đã được xem lại thủ công; ảnh hiển thị trạng thái lỗi do 500 tạm thời được ghi rõ trong `screen-catalog.md`.

### A6. Phiên không hợp lệ không bị xoá ở client (Thấp — khác AC PB08)

`GET /auth/session` trả **200 `{"user":null}`** cho token sai hoặc không có token (Backlog PB08 mô tả `GET /auth/me` trả 401). Client coi là chưa đăng nhập và chuyển về `/login`, nhưng **token hỏng vẫn nằm trong localStorage** (đã kiểm tra bằng script). Ảnh: `sprint-01/screenshots/PB08/`.

### A7. OAuth trả 500 trên môi trường local (TB — cấu hình)

`GET /auth/google`, `/auth/github`, `/auth/linkedin` → 500; `remotesea-api/.env` không có biến `GOOGLE_*`, `GITHUB_*`, `LINKEDIN_*`. Bấm "Continue with Google" → trình duyệt rời ứng dụng sang trang **JSON lỗi thô** của API (ảnh `sprint-01/screenshots/PB04/PB04-guest-oauth-google-click-local-500.png`). Hai vấn đề: thiếu cấu hình (môi trường) và không có trang lỗi thân thiện khi OAuth hỏng (UI).

### A8. Settings của nhà tuyển dụng gọi `GET /talent/me` → 404 (Thấp)

Mở `/settings` hoặc trang công ty bằng tài khoản EMPLOYER phát sinh `GET /talent/me -> 404` (và `GET /saved/ids -> 403`). Không làm hỏng giao diện, nhưng là request thừa theo vai trò.

### A9. Tài khoản seed `talent1@remotesea.dev` bị bật 2FA trong lúc chụp (cần nhóm kiểm tra)

- Khoảng 21:40 ngày 21/10, `POST /auth/login` cho `talent1@remotesea.dev` bắt đầu trả `{"twoFactorRequired": true, …}` (subject của challenge token là id của talent1). Trước đó cùng ngày tài khoản này đăng nhập bình thường (bộ ảnh toàn ứng dụng và lượt chụp Sprint 1 đầu tiên).
- Các script chụp **chỉ** bật/tắt 2FA trên tài khoản dùng một lần `e2e-ui-s1-…@example.com` (manifest `PB10`/`PB11`, phiên `dt`); không có bước nào bấm công tắc 2FA trên tài khoản seed. CSDL Supabase được dùng chung, nên khả năng cao là thay đổi từ người khác — **chưa xác minh được**, schema không lưu thời điểm bật 2FA.
- Hệ quả: các ảnh Sprint 1 "tài khoản seed, chỉ xem" được chụp lại bằng `candidate.strong@remotesea.dev` (Ứng viên seed có hồ sơ PUBLIC đầy đủ). Ai giữ authenticator của talent1 cần tắt 2FA nếu muốn dùng lại tài khoản này cho kiểm thử.

## B. Tính năng bị ẩn bởi cấu hình

### B1. Trợ lý AI (PB94–PB96) không hiển thị với cấu hình hiện tại (TB)

- `RootLayout.tsx` chỉ render `AiChatWidget` khi `VITE_ENABLE_AI_CHAT === "true"`. `.env` local và `fly.toml` đều **không** đặt biến này → widget ẩn trên server :3001 và trên bản deploy.
- Cách đã dùng để chụp: dev server thứ hai ở cổng 3002 với `VITE_ENABLE_AI_CHAT=true` trong process env và cache riêng (`.env` không sửa, server :3001 không bị ảnh hưởng). API chỉ cho phép CORS từ `FRONTEND_URL` (:3001), nên Playwright chuyển tiếp các request **GET** từ :3002 với origin :3001; mọi request ghi bị chặn. **Không gửi câu hỏi nào** cho AI (sẽ gọi LLM và lưu hội thoại) → nội dung trả lời (PB94 AC 3–4) và hội thoại nhiều lượt (PB95) **chưa xác minh**.

## C. Màn hình / trạng thái chưa chụp được

| Màn hình / trạng thái                                                                                                                                                   | PB               | Lý do                                                                          | Cách xử lý tiếp                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Nhập mã 2FA khi đăng nhập                                                                                                                                               | PB03             | Không có tài khoản test đã bật 2FA; bật 2FA sẽ ghi dữ liệu (`/auth/2fa/setup`) | Dùng CSDL test riêng, bật 2FA cho một tài khoản rồi chụp     |
| Luồng bật/tắt 2FA (QR, backup codes)                                                                                                                                    | PB10, PB11       | Bấm "Enable" gọi API tạo secret (ghi dữ liệu)                                  | Như trên                                                     |
| Đăng nhập / liên kết OAuth thành công                                                                                                                                   | PB04, PB05, PB18 | Cần tài khoản Google/GitHub/LinkedIn thật                                      | Chụp thủ công trên môi trường test                           |
| Đặt lại mật khẩu / xác minh email / xác minh tên miền thành công                                                                                                        | PB07, PB22, PB32 | Cần token thật trong email                                                     | Lấy token từ CSDL test                                       |
| Chấp nhận lời mời vào công ty                                                                                                                                           | PB36             | Tạo lời mời sẽ gửi email thật                                                  | Như trên                                                     |
| Thanh toán Stripe thành công, trang success có dữ liệu                                                                                                                  | PB43, PB80, PB81 | Không thanh toán thật (theo yêu cầu an toàn)                                   | Stripe test mode + webhook test (xem `playwright.config.ts`) |
| Trạng thái **thành công** sau khi gửi form (ứng tuyển, đổi mật khẩu, tạo alert, mời thành viên, gửi tin nhắn, chấm scorecard, đề xuất phỏng vấn, duyệt tin, khoá user…) | nhiều            | Sẽ ghi vào CSDL dùng chung                                                     | Chụp trên CSDL test có thể reset                             |
| Phân trang nhiều trang ở /jobs                                                                                                                                          | PB47             | Chỉ có 9 tin đang mở, mỗi trang 20                                             | Seed thêm dữ liệu                                            |

## D. PB không có giao diện riêng (xử lý nền)

| PB   | Tính năng                                | Ghi chú                                                          |
| ---- | ---------------------------------------- | ---------------------------------------------------------------- |
| PB44 | Tự động duyệt tin đủ điều kiện           | Logic phía API khi đăng tin; chỉ thấy kết quả qua trạng thái tin |
| PB46 | Tự động hết hạn tin (cron)               | `@nestjs/schedule` phía API                                      |
| PB78 | Tự động gửi email việc làm khớp cảnh báo | Cron + email; UI chỉ có phần tạo/quản lý cảnh báo (PB76/77)      |
| PB81 | Xác nhận thanh toán qua Stripe webhook   | Endpoint webhook; UI chỉ thấy trang trả về `/post-job/success`   |

## E. Màn hình chưa ánh xạ được vào PB (UNMAPPED)

Landing page `/`, trang giới thiệu nhà tuyển dụng `/employer`, `/blog`, `/community`, trang 404, Sprint Board `/sprints` (công cụ nội bộ), tab **Revenue** của Admin. `sprint-routes.ts` cũng đánh dấu `/employer`, `/blog`, `/community` là `"unassigned"`.

## F. Khác biệt giữa Backlog và implementation (quan sát qua UI / source)

| PB   | Backlog nói                | Implementation                                                                            | Nguồn                                                              |
| ---- | -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| PB32 | Mã OTP, nhập trong 15 phút | Liên kết/token qua email                                                                  | `SPRINT2_TEST_REPORT.md` (S2-D15), trang `/employer/verify?token=` |
| PB47 | Lọc theo Quốc gia          | Bộ lọc nhóm "Timezone / Location" (SEA/APAC, SG/AU/US-based…), không có dropdown quốc gia | Ảnh `PB47-guest-jobs-job-board-desktop.png`, `job-filters.ts`      |
| PB94 | Widget AI ở góc màn hình   | Có trong code nhưng tắt bằng cờ mặc định                                                  | Mục B1                                                             |

## G. Điểm UI cần lưu ý khi viết báo cáo

| Mục                                                          | Mức  | Chi tiết                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Invalid Date" ở Admin → Nhà tuyển dụng                      | TB   | Cột "Tham gia" hiển thị **Invalid Date** cho mọi công ty (ảnh `sprint-04/PB83-admin-admin-employers-desktop.png`) — lỗi định dạng/thiếu trường ngày.                                                                                                                                                                                             |
| Email cá nhân trong dữ liệu seed                             | Thấp | Danh sách lời mời đang chờ của công ty seed chứa một địa chỉ Gmail cá nhân. Script che mọi email không thuộc `@remotesea.dev` / `@example.com` trong ảnh.                                                                                                                                                                                        |
| Huy hiệu "Verified" giả ở Settings                           | TB   | `AccountSection.tsx` luôn hiển thị "Verified" cạnh email, không phụ thuộc trạng thái xác minh — tài khoản vừa đăng ký, chưa xác minh vẫn thấy "Verified" (ảnh `sprint-01/screenshots/PB14/`). Mâu thuẫn với PB22.                                                                                                                                |
| Tài khoản Admin hiển thị tiếng Việt                          | Thấp | Tài khoản seed `admin@remotesea.dev` có tuỳ chọn ngôn ngữ "Tiếng Việt" (ưu tiên hơn ngôn ngữ trình duyệt) → toàn bộ ảnh Admin là giao diện **tiếng Việt**, các vai trò khác là tiếng Anh. Không đổi được vì sẽ ghi vào tài khoản seed.                                                                                                           |
| Navbar tiếng Việt bị xuống dòng ở desktop                    | TB   | Ở 1440px, nhãn navbar tiếng Việt ("Việc làm", "Mức lương", "Dành cho nhà tuyển dụng", "Bảng điều khiển", "Đăng xuất") bị ngắt thành 2 dòng; select vai trò "Nhà tuyển dụng" trong bảng Admin → Users tràn chữ. Ảnh `sprint-04/PB90-admin-admin-users-desktop.png`.                                                                               |
| Nhãn "UPCOMING INTERVIEW" cho buổi đã qua                    | TB   | `/applications/:id/interview` (ứng viên) hiển thị "UPCOMING INTERVIEW — Thu, Sep 24" trong khi ngày chụp là 21/10 và ngay dưới là "Your interview … is complete". Ảnh `sprint-03/PB61-talent-interviews-interview-talent-desktop.png`.                                                                                                           |
| Dòng thời gian đơn ứng tuyển bị cắt                          | Thấp | `ApplicationTimeline` dùng `overflow-x-auto`; ở 1440px chỉ thấy 4/6 mốc (Applied → Shortlisted) dù đơn đang ở Offer, không có dấu hiệu cần cuộn ngang. Ảnh `sprint-03/PB54-talent-applications-application-offer-desktop.png`.                                                                                                                   |
| Thanh 'All changes saved · just now' ở Settings là trang trí | TB   | `SettingsSaveBar.tsx` (comment trong code: "this bar is decorative") luôn hiển thị "All changes saved · just now" — kể cả khi lưu **thất bại** (ảnh `sprint-01/pb15-pb20/PB15/PB15-notification-preferences-network-error-simulated.png`: toast lỗi + thanh vẫn báo đã lưu). Người dùng có thể hiểu sai trạng thái lưu.                          |
| Settings lưu ngay, Pause không xác nhận                      | TB   | Ngôn ngữ / khu vực / tiền tệ, mọi công tắc thông báo, công tắc hiển thị hồ sơ đều **lưu ngay khi đổi**; nút **Pause** tạm dừng tài khoản ngay, không có hộp xác nhận, rồi **tự đăng xuất** người dùng (Backlog PB16 yêu cầu hộp cảnh báo).                                                                                                       |
| Dữ liệu tin nhắn thử nghiệm                                  | Thấp | Luồng tin nhắn của tài khoản seed chứa tin thử ("test", "xin chao", "kkkk", "hehe"). Nếu đưa ảnh vào báo cáo nên ghi chú là dữ liệu thử nghiệm.                                                                                                                                                                                                  |
| Số liệu tĩnh ở trang đăng nhập                               | Thấp | Panel trái `/login` hiển thị "12 jobs added this week", "2 match your filters", "$3.2k median salary" và 2 thẻ việc làm "Canva · AU", "Linear · US" — **viết cứng** trong `LoginPage.tsx`, không phải dữ liệu thật. Không mô tả là thống kê thời gian thực.                                                                                      |
| Dark mode                                                    | Thấp | `darkMode: ["class"]` có trong config nhưng không dùng → chỉ có giao diện sáng.                                                                                                                                                                                                                                                                  |
| Không có primitive Modal                                     | Thấp | Ứng tuyển, báo cáo, thêm kinh nghiệm… mở **inline**; chỉ Sign-out và một số xác nhận dùng dialog.                                                                                                                                                                                                                                                |
| Font mono                                                    | Thấp | `--font-mono: JetBrains Mono` không được tải → hiển thị bằng `ui-monospace`.                                                                                                                                                                                                                                                                     |
| Ngày Sprint không thống nhất giữa các tài liệu               | Thấp | Sprint Board (`/sprints`, sinh từ `docs/PROJECT_PLAN.md`): S1 06/10–28/10, S2 29/10–18/11, S3 19/11–08/12, S4 09/12–22/12/2026. `ProjectPlan.md` ở thư mục gốc: S1 02/07–15/07 … S4 13/08–26/08/2026. Product Backlog: dự án 28/09–15/12/2026. Danh sách PB theo Sprint (§2.3 Backlog) thì khớp nhau. Báo cáo nên chọn một nguồn ngày và ghi rõ. |

## H. Giới hạn của chính bộ bằng chứng này

- Ảnh chụp từ **dev server** với các thay đổi i18n chưa commit trong working tree tại thời điểm chụp; build production có thể khác nhẹ.
- Dữ liệu là dữ liệu seed/test dùng chung trên CSDL Supabase được cấu hình; nội dung (tên, số lượng) có thể thay đổi giữa các lần chụp.
- Locale chụp: `en-US`. Giao diện tiếng Việt chưa được chụp đầy đủ (chạy lại với `--locale=vi`).
- Một số thao tác "mở" có thể ghi dữ liệu phụ theo thiết kế của ứng dụng (đăng nhập tạo bản ghi Session; nhà tuyển dụng mở hồ sơ ứng viên có thể cập nhật `viewedAt` / lượt xem hồ sơ). Không có thao tác tạo/sửa/xoá dữ liệu nghiệp vụ nào được thực hiện.
