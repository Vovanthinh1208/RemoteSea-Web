# RemoteSEA — Product Backlog / User Story Specification

> Nguồn sự thật duy nhất: source code tại `/Users/mac/ProjectDinotech/remotesea-full` (remotesea-api = NestJS, remotesea-web = React, remotesea-ai = FastAPI). Mọi User Story dưới đây được trích trực tiếp từ code (controller/service/DTO/guard/Prisma schema/frontend), có trích dẫn `file:line`. Không có feature/permission/business rule nào được suy đoán. Chỗ chưa chắc chắn được đánh dấu `[NEEDS_VERIFICATION]`, `[PARTIAL]`, `[DOCUMENTED_ONLY]`.

---

## PHẦN 1 — SYSTEM UNDERSTANDING

### Sản phẩm
RemoteSEA là nền tảng tuyển dụng từ xa cho Đông Nam Á, gồm 3 dịch vụ độc lập:
- **remotesea-web** — React 19 + TypeScript + Vite (SPA, không có server riêng).
- **remotesea-api** — NestJS 10, kiến trúc Controller → Service → Repository, Prisma 5 + PostgreSQL, JWT/Passport (Google/GitHub/LinkedIn OAuth), Stripe billing, S3 uploads.
- **remotesea-ai** — FastAPI (Python), Clean Architecture 4 tầng, mô hình mặc định Qwen2.5-3B-Instruct tự triển khai qua Ollama, RAG lai (Qdrant + PostgreSQL full-text), là "AI Orchestrator" gọi ngược vào remotesea-api qua context token JWT.

### Tác nhân của hệ thống (Actors)

#### Tác nhân chính
| STT | Tác nhân | Mô tả | Vai trò / Phạm vi hoạt động | Nguồn xác nhận |
|---|---|---|---|---|
| 1 | **Talent (Ứng viên)** | Người sử dụng nền tảng để tìm kiếm và ứng tuyển các công việc remote. | Quản lý hồ sơ cá nhân, CV, kỹ năng; tìm kiếm việc làm; lưu việc; ứng tuyển và theo dõi quá trình ứng tuyển. | `UserRole.TALENT` (schema.prisma:15-19) |
| 2 | **Employer (Nhà tuyển dụng)** | Người dùng đại diện cho doanh nghiệp để thực hiện các hoạt động tuyển dụng trên hệ thống. | Quản lý công ty, đăng và quản lý tin tuyển dụng, xem và xử lý ứng viên, thực hiện các hoạt động trong quy trình tuyển dụng. | `UserRole.EMPLOYER` |
| 3 | **Admin (Quản trị viên)** | Người chịu trách nhiệm quản trị, kiểm soát và giám sát hoạt động của nền tảng. | Quản lý người dùng, công ty, tin tuyển dụng và các nội dung/quy trình quản trị của hệ thống. | `UserRole.ADMIN`, `RolesGuard` + `@Roles("ADMIN")` toàn bộ `admin.controller.ts` |

> **Quy ước gọi tên trong backlog:** "Talent / Employer" = người dùng thuộc một trong hai vai trò (kể cả khi chức năng không yêu cầu đăng nhập); "Employer (Owner / Recruiter / …)" = thành viên công ty có vai trò tương ứng.

#### Các vai trò thuộc Employer
Vai trò chi tiết trong công ty do `CompanyMemberRole` (schema.prisma:1172-1177) quyết định — 1 user = 1 company (`userId` `@unique`).

| Vai trò | Mô tả | Một số hoạt động chính |
|---|---|---|
| **Owner (Chủ doanh nghiệp)** | Người sở hữu/quản lý công ty trên hệ thống. | Quản lý thông tin công ty, thành viên và quyền truy cập; quản lý tin tuyển dụng và hoạt động tuyển dụng. |
| **Recruiter (Nhà tuyển dụng)** | Người trực tiếp thực hiện các hoạt động tuyển dụng. | Đăng/quản lý tin tuyển dụng, xem và sàng lọc ứng viên, cập nhật trạng thái ứng tuyển. |
| **Hiring Manager (Quản lý tuyển dụng)** | Người phụ trách đánh giá và ra quyết định trong quy trình tuyển dụng. | Xem ứng viên, đánh giá ứng viên và tham gia quyết định tuyển dụng. |
| **Interviewer (Người phỏng vấn)** | Người tham gia đánh giá ứng viên thông qua phỏng vấn. | Xem thông tin ứng viên được phân công và thực hiện/ghi nhận kết quả phỏng vấn. |

Một `User` có đúng 1 `UserRole` cấp tài khoản; nếu là Employer, quyền chi tiết trong công ty do `CompanyMemberRole` quyết định (không phải `UserRole`).

#### Tác nhân phụ (hệ thống / bên ngoài)
| Tác nhân | Mô tả | Nguồn xác nhận |
|---|---|---|
| **System (cron/webhook)** | Tác vụ tự động: hết hạn tin, gửi job alert, đối soát thanh toán, nhận webhook Stripe. | `CronSecretGuard` (jobs/cron/expire, alerts/cron/dispatch, billing/cron/reconcile); Stripe webhook (không auth, verify chữ ký) |
| **AI Orchestrator (remotesea-ai)** | Dịch vụ AI gọi ngược remotesea-api, đóng vai "assistant", không phải user thật. | Context JWT ký bằng `AI_SERVICE_SECRET` |
| **OAuth Provider (Google/GitHub/LinkedIn)** | Bên thứ ba xác thực danh tính người dùng. | `auth.module.ts:18-28`, đăng ký strategy có điều kiện theo ENV |

### Kiến trúc & luồng nghiệp vụ chính
1. **Đăng ký/xác thực** → tạo `User` (TALENT hoặc EMPLOYER) → nếu EMPLOYER, tạo `EmployerProfile`+`CompanyMember(OWNER)` khi "tạo hồ sơ công ty" (không phải lúc đăng ký).
2. **Đăng tin**: OWNER/RECRUITER tạo Job (DRAFT) → thanh toán Stripe → webhook chuyển `PENDING_REVIEW` → tự động duyệt (nếu employer đã verify + mô tả đạt chuẩn) hoặc admin duyệt thủ công → `ACTIVE` → tự hết hạn (cron) hoặc chủ động đóng.
3. **Ứng tuyển**: Talent apply → Employer duyệt hồ sơ qua state machine `ApplicationStatus` → đề xuất phỏng vấn → talent xác nhận lịch → chấm scorecard → ra offer → talent accept/decline.
4. **Giao tiếp**: nhắn tin theo ngữ cảnh 1 Application (polling 8s, không websocket), thông báo in-app (luôn bật), job alert qua email (cron/endpoint ngoài).
5. **AI**: (a) CV Analysis — pipeline gọi thẳng Anthropic/Gemini từ NestJS, cache 1:1 với Application, **đây là tính năng AI CV thật đang chạy**; (b) AI Chat — proxy qua remotesea-ai, RAG lai + tool-calling có phân quyền, **thật, đang chạy**; (c) CANDIDATE_ANALYSIS/Feedback-loop/Dataset-Builder/Model-Registry của remotesea-ai — **hạ tầng đầy đủ nhưng KHÔNG có caller nào từ remotesea-api/remotesea-web** (infra-only, xem Phần 5).
6. **Thanh toán**: Stripe Checkout duy nhất cho việc đăng tin (không có free plan), webhook `checkout.session.completed` là nguồn sự thật duy nhất; không có billing history UI, không có refund.
7. **Quản trị**: admin xác minh/đình chỉ employer, duyệt/từ chối job, xử lý report vi phạm, ban/đổi role user — mọi hành động ghi `AdminAuditLog` thủ công (không phải interceptor tự động).

### Kiến trúc AI
Xem README `remotesea-ai` + `docs/intelligent-rag.md`. Điểm mấu chốt cho backlog: **AI Chat là tính năng sống động, thật, có UI đầy đủ**; **CANDIDATE_ANALYSIS/Feedback/Dataset/Model-Registry là API thật nhưng chưa được gọi từ đâu cả** — không tạo User Story cho nhóm sau (theo quy tắc #17/#18, API tồn tại không đồng nghĩa User Story), chỉ liệt kê ở Gap Analysis.

### Kiến trúc thanh toán
`PlanType`: STANDARD ($150/30 ngày), FEATURED ($350/60 ngày), HANDS_ON ($1,200/không hết hạn) — `plan.constants.ts`. Mọi job đều phải trả phí (không có gói free).

### Kiến trúc thông báo
1 kênh in-app (`Notification`, luôn bật, không bị `NotificationPreference` chặn) + kênh email (bị gate bởi từng preference riêng: `applicationUpdates`, `employerMessages`, `weeklyDigest`, `instantMatchAlerts`). `NotificationPreference` cho phần lớn field khác (`productNews`, `tipsAndResources`, `browserPush`) **được lưu nhưng không nơi nào đọc để gửi thật** — tính năng nửa vời.

---

## PHẦN 2 — PRODUCT BACKLOG

| ID | Epic | User Story | Actor | Priority | Status | SP |
|---|---|---|---|---|---|---|
| US-AUTH-001 | 01. Auth & Account | Đăng ký tài khoản (TALENT/EMPLOYER) | Talent / Employer (người dùng mới) | P0 | Implemented | 3 |
| US-AUTH-002 | 01. Auth & Account | Đăng nhập bằng email/mật khẩu | Talent / Employer | P0 | Implemented | 3 |
| US-AUTH-003 | 01. Auth & Account | Xác thực 2 lớp khi đăng nhập (2FA challenge) | Talent / Employer (đã bật 2FA) | P1 | Implemented | 3 |
| US-AUTH-004 | 01. Auth & Account | Đăng nhập bằng Google/GitHub/LinkedIn OAuth | Talent / Employer | P1 | Implemented | 5 |
| US-AUTH-005 | 01. Auth & Account | Liên kết tài khoản OAuth vào tài khoản hiện có | Talent / Employer | P2 | Implemented | 3 |
| US-AUTH-006 | 01. Auth & Account | Quên mật khẩu | Talent / Employer | P0 | Implemented | 2 |
| US-AUTH-007 | 01. Auth & Account | Đặt lại mật khẩu qua email | Talent / Employer | P0 | Implemented | 2 |
| US-AUTH-008 | 01. Auth & Account | Đọc trạng thái phiên đăng nhập hiện tại | Talent / Employer / System | P1 | Implemented | 1 |
| US-AUTH-009 | 01. Auth & Account | Đăng xuất | Talent / Employer | P2 | Partial | 1 |
| US-AUTH-010 | 01. Auth & Account | Bật xác thực 2 lớp (setup + verify) | Talent / Employer | P1 | Implemented | 5 |
| US-AUTH-011 | 01. Auth & Account | Tắt xác thực 2 lớp | Talent / Employer | P1 | Implemented | 3 |
| US-AUTH-012 | 01. Auth & Account | Đổi mật khẩu (đã đăng nhập) | Talent / Employer | P0 | Implemented | 3 |
| US-AUTH-013 | 01. Auth & Account | Cập nhật tên hiển thị | Talent / Employer | P3 | Implemented | 1 |
| US-AUTH-014 | 01. Auth & Account | Cập nhật thông tin tài khoản (phone/ngôn ngữ/khu vực/tiền tệ/avatar) | Talent / Employer | P2 | Partial | 3 |
| US-AUTH-015 | 01. Auth & Account | Cấu hình tuỳ chọn thông báo | Talent / Employer | P2 | Partial | 2 |
| US-AUTH-016 | 01. Auth & Account | Tạm dừng / Kích hoạt lại tài khoản | Talent / Employer | P3 | Implemented | 2 |
| US-AUTH-017 | 01. Auth & Account | Xuất dữ liệu cá nhân | Talent / Employer | P3 | Implemented | 1 |
| US-AUTH-018 | 01. Auth & Account | Quản lý tài khoản liên kết (connections) | Talent / Employer | P3 | Implemented | 2 |
| US-AUTH-019 | 01. Auth & Account | Quản lý phiên đăng nhập đang hoạt động | Talent / Employer | P2 | Implemented | 3 |
| US-AUTH-020 | 01. Auth & Account | Xoá tài khoản | Talent / Employer | P1 | Implemented | 5 |
| US-TALENT-001 | 02. Talent Profile | Tạo/cập nhật hồ sơ ứng viên | Talent | P0 | Implemented | 5 |
| US-TALENT-002 | 02. Talent Profile | Xác minh email ứng viên | Talent | P2 | Implemented | 2 |
| US-TALENT-003 | 02. Talent Profile | Thiết lập chế độ hiển thị hồ sơ | Talent | P1 | Partial | 2 |
| US-TALENT-004 | 02. Talent Profile | Quản lý kinh nghiệm làm việc | Talent | P1 | Implemented | 3 |
| US-TALENT-005 | 02. Talent Profile | Quản lý điểm nhấn hồ sơ (portfolio/học vấn/ngôn ngữ) | Talent | P2 | Implemented | 3 |
| US-TALENT-006 | 02. Talent Profile | Xem bảng điều khiển ứng viên | Talent | P1 | Implemented | 3 |
| US-TALENT-007 | 02. Talent Profile | Xem thống kê lượt xem hồ sơ | Talent | P2 | Implemented | 2 |
| US-TALENT-008 | 02. Talent Profile | Xem hồ sơ công khai của ứng viên | Employer | P1 | Implemented | 3 |
| US-TALENT-009 | 02. Talent Profile | Tìm kiếm ứng viên | Employer | P1 | Implemented | 5 |
| US-EMP-001 | 03. Employer & Company | Tạo hồ sơ công ty (trở thành Employer) | Talent → Employer | P0 | Implemented | 3 |
| US-EMP-002 | 03. Employer & Company | Cập nhật hồ sơ công ty | Employer (Owner) | P1 | Partial | 3 |
| US-EMP-003 | 03. Employer & Company | Xác minh công ty qua email domain | Employer (Owner) | P1 | Implemented | 3 |
| US-EMP-004 | 03. Employer & Company | Xem hồ sơ công ty công khai | Talent / Employer | P1 | Implemented | 2 |
| US-EMP-005 | 03. Employer & Company | Xem bảng điều khiển nhà tuyển dụng | Employer (mọi vai trò) | P0 | Implemented | 3 |
| US-TEAM-001 | 04. Team Management | Mời thành viên vào công ty | Employer (Owner) | P1 | Implemented | 3 |
| US-TEAM-002 | 04. Team Management | Chấp nhận lời mời gia nhập công ty | Talent / Employer (được mời) | P1 | Implemented | 3 |
| US-TEAM-003 | 04. Team Management | Xem danh sách thành viên công ty | Employer (mọi vai trò) | P1 | Implemented | 1 |
| US-TEAM-004 | 04. Team Management | Thu hồi lời mời đang chờ | Employer (Owner) | P2 | Implemented | 1 |
| US-TEAM-005 | 04. Team Management | Đổi vai trò thành viên / Chuyển giao OWNER | Employer (Owner) | P1 | Implemented | 5 |
| US-TEAM-006 | 04. Team Management | Xoá thành viên khỏi công ty | Employer (Owner) | P1 | Implemented | 2 |
| US-JOB-001 | 05. Job Management | Tạo tin tuyển dụng (nháp) | Employer (Owner / Recruiter) | P0 | Implemented | 5 |
| US-JOB-002 | 05. Job Management | Chỉnh sửa tin tuyển dụng | Employer (Owner / Recruiter) / Admin | P1 | Implemented | 3 |
| US-JOB-003 | 05. Job Management | Thanh toán để đăng tin | Employer (Owner) | P0 | Implemented | 5 |
| US-JOB-004 | 05. Job Management | Tự động duyệt tin đủ điều kiện | System | P0 | Implemented | 3 |
| US-JOB-005 | 05. Job Management | Đóng tin tuyển dụng | Employer (Owner / Recruiter) / Admin | P1 | Implemented | 2 |
| US-JOB-006 | 05. Job Management | Tin tuyển dụng tự hết hạn | System (cron) | P1 | Implemented | 2 |
| US-JOB-007 | 05. Job Management | Tìm kiếm & lọc tin tuyển dụng | Talent / Employer | P0 | Implemented | 5 |
| US-JOB-008 | 05. Job Management | Xem chi tiết tin tuyển dụng | Talent / Employer | P0 | Implemented | 2 |
| US-JOB-009 | 05. Job Management | Lưu / Bỏ lưu tin tuyển dụng | Talent / Employer (đã đăng nhập) | P2 | Implemented | 2 |
| US-JOB-010 | 05. Job Management | Xem điểm phù hợp với công việc | Talent | P2 | Implemented | 3 |
| US-TAXO-001 | 06. Taxonomy | Xem danh mục ngành nghề | Talent / Employer | P2 | Implemented | 1 |
| US-TAXO-002 | 06. Taxonomy | Tìm kiếm kỹ năng | Talent / Employer | P2 | Implemented | 1 |
| US-APP-001 | 07. Applications | Ứng tuyển vào tin tuyển dụng | Talent | P0 | Implemented | 5 |
| US-APP-002 | 07. Applications | Xem chi tiết đơn & dòng thời gian trạng thái | Talent | P0 | Implemented | 3 |
| US-APP-003 | 07. Applications | Rút đơn ứng tuyển | Talent | P1 | Implemented | 2 |
| US-APP-004 | 07. Applications | Phản hồi lời mời làm việc (Accept/Decline) | Talent | P0 | Implemented | 3 |
| US-EMPAPP-001 | 07. Applications | Xem danh sách ứng viên của 1 job | Employer (Owner / Recruiter / Hiring Manager) | P0 | Implemented | 3 |
| US-EMPAPP-002 | 07. Applications | Cập nhật trạng thái đơn ứng tuyển | Employer (Owner / Recruiter / Hiring Manager) | P0 | Implemented | 5 |
| US-EMPAPP-003 | 07. Applications | Cập nhật hàng loạt trạng thái đơn | Employer (Owner / Recruiter / Hiring Manager) | P1 | Implemented | 3 |
| US-INT-001 | 08. Interviews | Đề xuất lịch phỏng vấn | Employer (Owner / Recruiter / Hiring Manager) | P0 | Implemented | 5 |
| US-INT-002 | 08. Interviews | Xác nhận lịch phỏng vấn | Talent | P0 | Implemented | 3 |
| US-INT-003 | 08. Interviews | Huỷ lịch phỏng vấn | Employer (Owner / Recruiter / Hiring Manager) | P1 | Implemented | 2 |
| US-INT-004 | 08. Interviews | Tải file lịch (.ics) buổi phỏng vấn | Talent / Employer (team công ty) | P2 | Implemented | 1 |
| US-SC-001 | 09. Scorecards | Chấm điểm ứng viên sau phỏng vấn | Employer (team công ty + Interviewer được gán) | P1 | Implemented | 3 |
| US-SC-002 | 09. Scorecards | Xem tổng hợp scorecard của 1 đơn | Employer (team công ty + Interviewer được gán) | P1 | Implemented | 2 |
| US-CV-001 | 10. CV Analysis (AI) | Phân tích CV ứng viên bằng AI | Employer (Owner / Recruiter / Hiring Manager / Interviewer được gán) | P1 | Implemented | 5 |
| US-CV-002 | 10. CV Analysis (AI) | Chạy lại phân tích CV | (như trên) | P2 | Implemented | 2 |
| US-MSG-001 | 11. Messaging | Nhắn tin theo ngữ cảnh 1 đơn ứng tuyển | Talent & Employer (team công ty) | P0 | Implemented | 5 |
| US-COM-001 | 12. Internal Comments | Thảo luận nội bộ về 1 ứng viên | Employer (team công ty) | P2 | Implemented | 2 |
| US-REV-001 | 13. Reviews | Kiểm tra điều kiện được phép đánh giá | Talent / Employer | P2 | Implemented | 1 |
| US-REV-002 | 13. Reviews | Viết đánh giá hai chiều sau phỏng vấn | Talent / Employer | P2 | Implemented | 3 |
| US-REV-003 | 13. Reviews | Xem đánh giá công khai của 1 người dùng | Talent / Employer | P2 | Implemented | 2 |
| US-NOTIF-001 | 14. Notifications | Nhận thông báo trong ứng dụng | Talent / Employer | P1 | Implemented | 3 |
| US-NOTIF-002 | 14. Notifications | Xem số thông báo chưa đọc | Talent / Employer | P2 | Implemented | 1 |
| US-NOTIF-003 | 14. Notifications | Đánh dấu đã đọc thông báo | Talent / Employer | P2 | Implemented | 1 |
| US-ALERT-001 | 15. Job Alerts | Tạo cảnh báo việc làm theo tiêu chí | Talent | P2 | Implemented | 3 |
| US-ALERT-002 | 15. Job Alerts | Quản lý cảnh báo việc làm (sửa/bật-tắt/xoá) | Talent | P2 | Implemented | 2 |
| US-ALERT-003 | 15. Job Alerts | Gửi email khi có job khớp cảnh báo | System | P2 | Implemented | 5 |
| US-JINV-001 | 16. Job Invitations | Mời 1 ứng viên cụ thể ứng tuyển vào job | Employer (Owner / Recruiter) | P2 | Implemented | 3 |
| US-BILL-001 | 17. Billing | Thanh toán đăng tin qua Stripe Checkout | Employer (Owner) | P0 | Implemented | 5 |
| US-BILL-002 | 17. Billing | Xử lý xác nhận thanh toán tự động | System (Stripe webhook) | P0 | Implemented | 5 |
| US-SAL-001 | 18. Salary Insights | Xem số liệu tham khảo mức lương | Talent / Employer | P2 | Implemented | 2 |
| US-ADM-EMP-001 | 19. Admin: Employer | Xác minh thủ công 1 nhà tuyển dụng | Admin | P1 | Implemented | 2 |
| US-ADM-EMP-002 | 19. Admin: Employer | Đình chỉ 1 nhà tuyển dụng | Admin | P1 | Implemented | 3 |
| US-ADM-JOB-001 | 20. Admin: Job Moderation | Xem hàng đợi tin chờ duyệt | Admin | P0 | Implemented | 2 |
| US-ADM-JOB-002 | 20. Admin: Job Moderation | Duyệt / Từ chối tin tuyển dụng | Admin | P0 | Implemented | 5 |
| US-ADM-JOB-003 | 20. Admin: Job Moderation | Kiểm tra rủi ro tin bằng AI (advisory) | Admin | P2 | Implemented | 3 |
| US-ADM-REP-001 | 21. Admin: Job Reports | Báo cáo 1 tin tuyển dụng vi phạm | Talent / Employer (đã đăng nhập) | P1 | Implemented | 2 |
| US-ADM-REP-002 | 21. Admin: Job Reports | Xử lý báo cáo vi phạm | Admin | P1 | Implemented | 3 |
| US-ADM-USR-001 | 22. Admin: Users | Xem/tìm kiếm danh sách người dùng | Admin | P1 | Partial | 2 |
| US-ADM-USR-002 | 22. Admin: Users | Cấm / Bỏ cấm người dùng | Admin | P1 | Implemented | 3 |
| US-ADM-USR-003 | 22. Admin: Users | Đổi vai trò người dùng | Admin | P2 | Implemented | 2 |
| US-ADM-AUD-001 | 23. Admin: Audit Log | Xem nhật ký hành động quản trị | Admin | P2 | Implemented | 3 |
| US-AI-001 | 24. AI Chat | Đặt câu hỏi cho trợ lý AI có căn cứ dữ liệu | Talent / Employer | P1 | Implemented | 8 |
| US-AI-002 | 24. AI Chat | Trò chuyện nhiều lượt với trợ lý AI | Talent / Employer | P1 | Implemented | 5 |
| US-AI-003 | 24. AI Chat | Xem lại các cuộc hội thoại AI trước đó | Talent / Employer | P2 | Implemented | 2 |

**Tổng: 24 Epic, 93 User Story.** (Không tính các API infra-only của remotesea-ai — xem Phần 5.)

---

## PHẦN 3 — DETAILED USER STORIES

### EPIC 01 — Authentication & Account

#### [US-AUTH-001] — Đăng ký tài khoản
**Epic:** Auth & Account | **Actor:** Talent / Employer (người dùng mới) | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **người dùng mới**, tôi muốn **đăng ký tài khoản bằng email/mật khẩu và chọn vai trò (TALENT/EMPLOYER)**, để **bắt đầu sử dụng nền tảng**.

**Mô tả:** `POST /auth/register` tạo `User` với password hash bcrypt, tự tạo `talentSlug` nếu role=TALENT, tự động đăng nhập ngay sau khi tạo (không cần xác thực email), gửi welcome email nền.

**Acceptance Criteria:**
- AC-01 (Happy path): Given email chưa tồn tại, When submit `{name, email, password≥8, role}` hợp lệ, Then tài khoản được tạo, trả `{user, accessToken}`, HTTP 201.
- AC-02 (Validation): Given `password` < 8 ký tự hoặc `role` không thuộc {TALENT, EMPLOYER}, When submit, Then 400 validation error (Zod).
- AC-03 (Conflict): Given email đã tồn tại, When submit, Then 409 `EMAIL_ALREADY_REGISTERED`.
- AC-04 (Rate limit): Given đã register 5 lần từ cùng IP trong 60s, When submit lần thứ 6, Then 429 `RATE_LIMITED`.

**Business Rules:**
- Không thể tự đăng ký role ADMIN.
- Không có bước xác thực email bắt buộc — user được auto-login ngay.
- Race condition (double-submit cùng email) được bắt bằng Prisma P2002, trả cùng lỗi `EMAIL_ALREADY_REGISTERED`.

**Dependencies:** Không có (điểm vào hệ thống).

**Definition of Done:** Backend ✅ / API ✅ / Frontend ✅ / Validation ✅ / Rate limit ✅ / Error handling ✅ / Test: `[NEEDS_VERIFICATION]` (chưa xác nhận có unit test).

**Source Traceability:**
```
Backend: remotesea-api/src/modules/auth/auth.controller.ts:96-109; auth.service.ts:71-128; dto/register.dto.ts:5-10
Frontend: remotesea-web/src/features/auth/pages/RegisterPage.tsx; auth.schemas.ts:23-29
```

---

#### [US-AUTH-002] — Đăng nhập bằng email/mật khẩu
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **người dùng đã có tài khoản**, tôi muốn **đăng nhập bằng email/mật khẩu**, để **truy cập vào tài khoản của mình**.

**Mô tả:** `POST /auth/login` xác thực credential, kiểm tra banned status sau khi khớp mật khẩu (tránh lộ thông tin qua timing), nếu tài khoản bật 2FA thì trả challenge thay vì token thật.

**Acceptance Criteria:**
- AC-01 (Happy path): Given email/password đúng và không bật 2FA, When login, Then trả `{accessToken, user}`, tạo 1 `Session` row mới.
- AC-02 (2FA branch): Given tài khoản có `twoFactorEnabled=true`, When login đúng password, Then trả `{twoFactorRequired: true, challengeToken}` (không có accessToken thật).
- AC-03 (Authorization/Banned): Given tài khoản có `bannedAt` set, When login đúng password, Then 403 `ACCOUNT_BANNED`.
- AC-04 (Error handling): Given sai email hoặc password, Then 401 `INVALID_CREDENTIALS` (không phân biệt email không tồn tại hay sai password).
- AC-05 (Rate limit): Given 10 lần login sai trong 60s (theo IP hoặc theo email), Then 429 `RATE_LIMITED`.

**Business Rules:**
- Tài khoản OAuth-only (không có `passwordHash`) không login được bằng password → cùng lỗi `INVALID_CREDENTIALS`.
- `isPaused` KHÔNG chặn login (để user tự reactivate).

**Dependencies:** US-AUTH-001.

**Definition of Done:** Backend ✅ / API ✅ / Frontend ✅ / Rate limit kép (IP+email) ✅ / Error handling ✅.

**Source Traceability:**
```
Backend: auth.controller.ts:112-141; auth.service.ts:130-167,336-357; auth/constants.ts:14-15
Frontend: remotesea-web/src/features/auth/pages/LoginPage.tsx; auth.schemas.ts:16-20 (có field "remember")
```

---

#### [US-AUTH-003] — Xác thực 2 lớp khi đăng nhập (2FA challenge)
**Epic:** Auth & Account | **Actor:** Talent / Employer (đã bật 2FA) | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là một **người dùng đã bật 2FA**, tôi muốn **nhập mã OTP hoặc backup code để hoàn tất đăng nhập**, để **bảo vệ tài khoản khỏi truy cập trái phép chỉ bằng mật khẩu**.

**Mô tả:** `POST /auth/2fa/challenge` nhận `challengeToken` (từ bước login) + `code` (6 số TOTP hoặc backup code dạng `XXXXX-XXXXX`).

**Acceptance Criteria:**
- AC-01 (Happy path — TOTP): Given `challengeToken` hợp lệ + mã TOTP đúng, Then trả `{accessToken, user}`, tạo Session.
- AC-02 (Happy path — Backup code): Given nhập đúng 1 trong 8 backup code chưa dùng, Then đăng nhập thành công, backup code đó bị xoá (dùng 1 lần).
- AC-03 (Validation): Given `challengeToken` hết hạn (>5 phút) hoặc sai, Then 401 `INVALID_CHALLENGE_TOKEN`.
- AC-04 (Error handling): Given mã OTP/backup code sai, Then 400 `INVALID_TWO_FACTOR_CODE`.
- AC-05 (Rate limit): Given quá 10 lần thử trong 5 phút (theo IP hoặc theo accountId), Then 429.

**Business Rules:** `challengeToken` là JWT riêng, `purpose="2fa_challenge"`, TTL 5 phút, không dùng thay cho access token thật ở bất kỳ route nào khác.

**Dependencies:** US-AUTH-002, US-AUTH-010.

**Definition of Done:** Backend ✅ / Frontend ✅ (UI 6 ô OTP + toggle backup code).

**Source Traceability:**
```
Backend: auth.controller.ts:143-179; auth.service.ts:477-548
Frontend: remotesea-web/src/features/auth/components/TwoFactorChallengeForm.tsx
```

---

#### [US-AUTH-004] — Đăng nhập bằng Google/GitHub/LinkedIn OAuth
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 5

> Là một **người dùng**, tôi muốn **đăng nhập bằng tài khoản Google/GitHub/LinkedIn**, để **không phải nhớ thêm mật khẩu riêng cho RemoteSEA**.

**Mô tả:** 3 provider (nhiều hơn yêu cầu ban đầu chỉ nói Google/GitHub — LinkedIn cũng có đầy đủ). Mỗi provider chỉ được đăng ký nếu có đủ ENV credentials. Yêu cầu email đã verified từ phía provider. Access token thật không bao giờ nằm trong URL redirect — dùng exchange code ngắn hạn (60s).

**Acceptance Criteria:**
- AC-01 (Happy path): Given user bấm "Sign in with Google" và email Google đã verified, When OAuth callback thành công, Then redirect về `/auth/callback?code=...`, FE gọi `POST /auth/oauth/exchange` lấy accessToken thật.
- AC-02 (Validation): Given email từ provider CHƯA verified, Then đăng nhập bị từ chối (401 `AUTHENTICATION_REQUIRED`).
- AC-03 (Authorization/CSRF): Given `state` cookie không khớp hoặc thiếu, Then callback bị từ chối.
- AC-04 (Error handling): Given provider chưa cấu hình ENV ở backend, When bấm nút OAuth tương ứng, Then lỗi ở tầng Passport (**GAP**: FE hiện tĩnh cả 3 nút không kiểm tra provider có khả dụng hay không).

**Business Rules:** `findOrCreateOAuthUser` dùng transaction+upsert chống race condition double-click. Exchange code TTL 60 giây, chỉ dùng 1 lần.

**Dependencies:** US-AUTH-001 (user có thể chưa tồn tại, sẽ auto-create).

**Definition of Done:** Backend ✅ (3 provider) / Frontend ✅ nhưng có gap (không ẩn nút provider chưa cấu hình) → **[PARTIAL]** về UX.

**Source Traceability:**
```
Backend: auth.controller.ts:334-396; auth.module.ts:18-28; strategies/{google,github,linkedin}.strategy.ts; oauth-state.util.ts
Frontend: remotesea-web/src/features/auth/components/OAuthButtons.tsx; pages/AuthCallbackPage.tsx
```

---

#### [US-AUTH-005] — Liên kết tài khoản OAuth vào tài khoản hiện có
**Epic:** Auth & Account | **Actor:** Talent / Employer (đã đăng nhập) | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là một **người dùng đã đăng nhập**, tôi muốn **liên kết thêm 1 tài khoản Google/GitHub/LinkedIn vào tài khoản hiện tại**, để **có nhiều cách đăng nhập cho cùng 1 tài khoản**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given đã đăng nhập, When vào Settings > Connected accounts và bấm "Connect Google", Then redirect qua OAuth, callback link thành công, connection xuất hiện trong danh sách.
- AC-03 (Authorization): Given provider account đó đã gắn với **user khác**, Then 409 `CONNECTION_ALREADY_LINKED`.
- AC-04 (Error handling): Given đã tự link (no-op), Then vẫn trả thành công, redirect về Settings.

**Business Rules:** `GET /auth/:provider/link` yêu cầu JwtAuthGuard, tạo "link intent" JWT (`purpose=oauth_link`, TTL 10 phút) — vì redirect flow không thể tự gắn Authorization header.

**Dependencies:** US-AUTH-002, US-AUTH-018.

**Source Traceability:**
```
Backend: auth.controller.ts:242-250,358-396; auth.service.ts:317-330
Frontend: remotesea-web/src/features/settings (Connected accounts section)
```

---

#### [US-AUTH-006] — Quên mật khẩu
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P0 | **Status:** Implemented | **SP:** 2

> Là một **người dùng quên mật khẩu**, tôi muốn **nhận email chứa link đặt lại mật khẩu**, để **khôi phục quyền truy cập tài khoản**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given email tồn tại, When submit `POST /auth/forgot-password`, Then tạo token 1 giờ, gửi email nền, trả message cố định.
- AC-02 (Không lộ thông tin): Given email KHÔNG tồn tại, When submit, Then vẫn trả **cùng 1 message** `"If that email exists, a reset link was sent."` (không throw lỗi khác).
- AC-04 (Rate limit): Given 3 lần request trong 60s từ cùng IP, Then 429.

**Business Rules:** Response luôn generic để hạn chế account-enumeration (dù code tự thừa nhận vẫn còn rò rỉ nhẹ qua timing — xem GAP).

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: auth.controller.ts:414-429; auth.service.ts:550-571
Frontend: remotesea-web/src/features/auth/pages/ForgotPasswordPage.tsx
```

---

#### [US-AUTH-007] — Đặt lại mật khẩu qua email
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P0 | **Status:** Implemented | **SP:** 2

> Là một **người dùng có link reset password**, tôi muốn **đặt mật khẩu mới**, để **đăng nhập lại được**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given token hợp lệ + password mới ≥8 ký tự, When submit `POST /auth/reset-password`, Then mật khẩu được đổi, token bị vô hiệu hoá (single-use).
- AC-02 (Validation): Given `password` < 8 ký tự, Then 400 validation error.
- AC-03 (Error handling): Given token hết hạn/không tồn tại/đã dùng, Then 400 `INVALID_OR_EXPIRED_TOKEN`.
- AC-04 (Race condition): Given 2 request đồng thời cùng token, Then chỉ 1 request thành công (dùng `deleteMany` + count check), request còn lại nhận `INVALID_OR_EXPIRED_TOKEN`.

**Business Rules:** **KHÔNG** tự động revoke các session hiện có sau khi reset (khác với change-password/disable-2FA) — cần PO xác nhận đây có phải chủ ý hay là gap bảo mật.

**Dependencies:** US-AUTH-006.

**Source Traceability:**
```
Backend: auth.controller.ts (reset-password route); auth.service.ts:573-597; auth.repository.ts:124-152
Frontend: remotesea-web/src/features/auth/pages/ResetPasswordPage.tsx; auth.schemas.ts:36-45
```

---

#### [US-AUTH-008] — Đọc trạng thái phiên đăng nhập hiện tại
**Epic:** Auth & Account | **Actor:** Talent / Employer (qua Frontend) | **Priority:** P1 | **Status:** Implemented | **SP:** 1

> Là một **ứng dụng frontend**, tôi muốn **kiểm tra token hiện tại còn hợp lệ hay không**, để **quyết định hiển thị trạng thái đăng nhập/đăng xuất**.

**Acceptance Criteria:**
- AC-01: Given có Bearer token hợp lệ với session chưa bị revoke, When `GET /auth/session`, Then trả `{user: AuthenticatedUser}`, HTTP 200.
- AC-02: Given không có token hoặc token không hợp lệ/hết hạn/session đã bị revoke, Then trả `{user: null}`, **vẫn HTTP 200** (không throw).

**Business Rules:** Route hoàn toàn public — tự đọc header thủ công thay vì dùng Guard.

**Dependencies:** Không.

**Source Traceability:**
```
Backend: auth.controller.ts:232-240; auth.service.ts:199-221
Frontend: remotesea-web/src/contexts/AuthContext.tsx (4 trạng thái: loading/authenticated/unauthenticated/error)
```

---

#### [US-AUTH-009] — Đăng xuất
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** [PARTIAL] | **SP:** 1

> Là một **người dùng**, tôi muốn **đăng xuất khỏi tài khoản**, để **ngăn người khác dùng chung máy truy cập tài khoản của tôi**.

**Mô tả:** **GAP xác nhận**: không tồn tại endpoint `POST /auth/logout` nào trong backend. "Đăng xuất" chỉ xoá token ở client (localStorage/sessionStorage) + xoá React Query cache. Session row trong DB **không bị revoke**.

**Acceptance Criteria:**
- AC-01 (Happy path hiện tại): Given user bấm "Log out", When `logout()` chạy, Then token bị xoá khỏi storage, UI chuyển về trạng thái unauthenticated ngay lập tức, đồng bộ sang các tab khác qua `storage` event.
- AC-02 (Gap): Given user đăng xuất trên thiết bị A, Given token của họ bị đánh cắp trước đó, Then kẻ tấn công **vẫn dùng được token đó** cho tới khi JWT hết hạn tự nhiên hoặc user tự revoke session thủ công (US-AUTH-019) — vì không có server-side logout.

**Business Rules:** Server-side session chỉ bị revoke qua: đổi mật khẩu, tắt 2FA, admin ban/đổi role, hoặc user tự revoke qua Settings > Security.

**Dependencies:** US-AUTH-002, US-AUTH-019.

**Definition of Done:** Frontend ✅ (client-only) / Backend ❌ (endpoint không tồn tại) → cần PO quyết định có bổ sung `POST /auth/logout` revoke session hay chấp nhận thiết kế hiện tại.

**Source Traceability:**
```
Backend: (không tồn tại — đã xác nhận qua đọc toàn bộ auth.controller.ts)
Frontend: remotesea-web/src/contexts/AuthContext.tsx:246-250; components/layout/navbar.tsx
```

---

#### [US-AUTH-010] — Bật xác thực 2 lớp (Setup + Verify)
**Epic:** Auth & Account | **Actor:** Talent / Employer (đã đăng nhập) | **Priority:** P1 | **Status:** Implemented | **SP:** 5

> Là một **người dùng**, tôi muốn **bật xác thực 2 lớp bằng ứng dụng authenticator**, để **tăng bảo mật tài khoản**.

**Acceptance Criteria:**
- AC-01 (Setup): Given đã đăng nhập, When `POST /auth/2fa/setup`, Then nhận `{secret, otpauthUrl, qrCodeDataUrl}` (chưa bật, chỉ lưu tạm).
- AC-02 (Verify happy path): Given quét QR và nhập đúng mã 6 số hiện tại, When `POST /auth/2fa/verify`, Then `twoFactorEnabled=true`, nhận **8 backup code dạng `XXXXX-XXXXX` hiển thị đúng 1 lần**.
- AC-03 (Validation): Given chưa từng gọi `/setup`, When gọi `/verify`, Then 400 `TWO_FACTOR_SETUP_REQUIRED`.
- AC-04 (Error handling): Given mã 6 số sai, Then 400 `INVALID_TWO_FACTOR_CODE`.
- AC-05 (Rate limit): Given quá 10 lần thử trong 5 phút, Then 429.

**Business Rules:** Gọi `/setup` lần 2 trước khi verify sẽ ghi đè secret cũ (không cộng dồn). Backup code hash bcrypt, chỉ hiển thị plaintext đúng 1 lần duy nhất, không thể xem lại.

**Dependencies:** US-AUTH-002.

**Source Traceability:**
```
Backend: auth.controller.ts (2fa/setup, 2fa/verify); auth.service.ts:364-409
Frontend: remotesea-web/src/features/settings/components/TwoFactorSection.tsx (state machine idle|setting_up|backup_codes|disabling)
```

---

#### [US-AUTH-011] — Tắt xác thực 2 lớp
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là một **người dùng**, tôi muốn **tắt 2FA bằng cách xác nhận lại mật khẩu**, để **đơn giản hoá đăng nhập nếu không còn cần thiết**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given nhập đúng password hiện tại, When `POST /auth/2fa/disable`, Then `twoFactorEnabled=false`, xoá secret/backup codes, **revoke TẤT CẢ session** (kể cả session hiện tại).
- AC-02 (Validation/Idempotency): Given 2FA đã tắt sẵn, Then 400 `TWO_FACTOR_NOT_ENABLED` (check trước khi verify password).
- AC-03 (Authorization): Given tài khoản OAuth-only (không có password), Then 400 `SOCIAL_ACCOUNT_NO_PASSWORD`.
- AC-04 (Error handling): Given sai password, Then 401 `INVALID_CREDENTIALS`, ghi nhận metric thất bại.
- AC-05 (Rate limit): 5 lần / 5 phút.

**Business Rules:** Revoke toàn bộ session vì tắt 2FA được coi là security downgrade — giả định kẻ tấn công có thể đã có password bị lộ.

**Dependencies:** US-AUTH-010.

**Source Traceability:**
```
Backend: auth.controller.ts (2fa/disable); auth.service.ts:411-455
Frontend: TwoFactorSection.tsx (state "disabling")
```

---

#### [US-AUTH-012] — Đổi mật khẩu (đã đăng nhập)
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **người dùng đã đăng nhập**, tôi muốn **đổi mật khẩu bằng cách xác nhận mật khẩu cũ**, để **bảo vệ tài khoản nếu nghi ngờ bị lộ**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `currentPassword` đúng + `newPassword`≥8, When `POST /users/me/password`, Then mật khẩu đổi thành công, **revoke tất cả session** (kể cả hiện tại).
- AC-03 (Authorization): Given tài khoản OAuth-only, Then 400 `SOCIAL_ACCOUNT_NO_PASSWORD`.
- AC-04 (Error handling): Given sai `currentPassword`, Then 400 `CURRENT_PASSWORD_INCORRECT`.
- AC-05 (Rate limit): 5 lần/60s theo userId.

**Business Rules (Gap ghi nhận):** FE **không** tự động gọi `logout()` ngay sau khi đổi mật khẩu thành công — user vẫn thấy "đã đăng nhập" cho tới khi request kế tiếp nhận 401 rồi mới bị đá ra kèm toast "Session expired".

**Dependencies:** US-AUTH-002.

**Source Traceability:**
```
Backend: users.controller.ts (users/me/password); users.service.ts:88-123
Frontend: remotesea-web/src/features/settings/components/ChangePasswordForm.tsx; users.queries.ts:33-34
```

---

#### [US-AUTH-013] — Cập nhật tên hiển thị
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P3 | **Status:** Implemented | **SP:** 1

> Là một **người dùng**, tôi muốn **đổi tên hiển thị**, để **thông tin cá nhân luôn chính xác**.

**Acceptance Criteria:**
- AC-01: Given `name` 1-120 ký tự, When `PATCH /users/me`, Then tên được cập nhật.
- AC-02 (Validation): Given `name` rỗng hoặc >120 ký tự, Then 400.

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: users.controller.ts; dto/update-user.dto.ts
Frontend: remotesea-web/src/features/settings (Account section)
```

---

#### [US-AUTH-014] — Cập nhật thông tin tài khoản
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** [PARTIAL] | **SP:** 3

> Là một **người dùng**, tôi muốn **cập nhật số điện thoại/ngôn ngữ/khu vực/đơn vị tiền tệ/ảnh đại diện**, để **cá nhân hoá trải nghiệm**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given ít nhất 1 field hợp lệ, When `PATCH /users/me/account`, Then cập nhật thành công.
- AC-02 (Validation): Given không có field nào trong body, Then 400 (Zod `.refine` yêu cầu ≥1 field).
- AC-03 (Authorization — upload ownership): Given `image` URL không phải do chính user này upload qua `/uploads/presign`, Then 400 `UPLOAD_URL_NOT_OWNED`.

**Business Rules (Gap):** Avatar upload UI hiện **chỉ tồn tại trong form hồ sơ Talent** — user chỉ có tài khoản EMPLOYER (không có TalentProfile) hiện **không có đường dẫn UI nào** để đặt ảnh đại diện dù backend hỗ trợ đầy đủ.

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: users.controller.ts (users/me/account); dto/update-account.dto.ts; users.service.ts
Frontend: remotesea-web/src/features/settings/components/AccountSection.tsx (không có field avatar)
```

---

#### [US-AUTH-015] — Cấu hình tuỳ chọn thông báo
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** [PARTIAL] | **SP:** 2

> Là một **người dùng**, tôi muốn **bật/tắt các loại thông báo email**, để **kiểm soát lượng email nhận được**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given ≥1 field boolean, When `PATCH /users/me/notification-preferences`, Then lưu vào `NotificationPreference`.
- AC-02 (Enforcement thật): Given `weeklyDigestEnabled=false`, When cron alert chạy, Then user không nhận email weekly digest (US-ALERT-003) — **CÓ enforcement thật cho `weeklyDigest`/`instantMatchAlerts`/`employerMessages`/`applicationUpdates`**.
- AC-03 (Gap — không enforcement): Given `productNews`/`tipsAndResources`/`browserPush` bất kỳ giá trị nào, Then **không có nơi nào trong code đọc lại các field này để gửi gì cả** — toggle này chỉ lưu DB, không có tác dụng thật.

**Dependencies:** US-AUTH-001.

**Definition of Done:** Backend ✅ (lưu) / Enforcement ⚠️ Partial (chỉ 4/7 field có tác dụng thật) / Frontend ✅.

**Source Traceability:**
```
Backend: users.controller.ts (notification-preferences); dto/update-notification-preferences.dto.ts:3-5 (tự comment thừa nhận gap)
Frontend: remotesea-web/src/features/settings (Notifications section)
```

---

#### [US-AUTH-016] — Tạm dừng / Kích hoạt lại tài khoản
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P3 | **Status:** Implemented | **SP:** 2

> Là một **người dùng**, tôi muốn **tạm dừng tài khoản thay vì xoá hẳn**, để **ẩn hồ sơ tạm thời và có thể quay lại sau**.

**Acceptance Criteria:**
- AC-01: Given đã đăng nhập, When `POST /users/me/pause`, Then `isPaused=true`.
- AC-02: Given tài khoản đang pause, When login lại và `POST /users/me/reactivate`, Then `isPaused=false`.

**Business Rules:** `isPaused` KHÔNG chặn đăng nhập (US-AUTH-002 AC liên quan).

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: users.controller.ts (users/me/pause, users/me/reactivate)
Frontend: remotesea-web/src/features/settings (Danger zone)
```

---

#### [US-AUTH-017] — Xuất dữ liệu cá nhân
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P3 | **Status:** Implemented | **SP:** 1

> Là một **người dùng**, tôi muốn **tải xuống dữ liệu tài khoản của mình**, để **có bản sao lưu/tuân thủ quyền riêng tư dữ liệu**.

**Acceptance Criteria:**
- AC-01: Given đã đăng nhập, When `GET /users/me/export`, Then trả `{exportedAt, account}` dạng JSON.

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: users.controller.ts (users/me/export)
Frontend: remotesea-web/src/features/settings (Privacy section)
```

---

#### [US-AUTH-018] — Quản lý tài khoản liên kết (Connections)
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P3 | **Status:** Implemented | **SP:** 2

> Là một **người dùng**, tôi muốn **xem và gỡ các tài khoản OAuth đã liên kết**, để **kiểm soát các phương thức đăng nhập của mình**.

**Acceptance Criteria:**
- AC-01: Given có ≥1 connection, When `GET /users/me/connections`, Then trả danh sách provider đã liên kết.
- AC-03 (Authorization/Business rule): Given tài khoản KHÔNG có password VÀ chỉ còn đúng 1 connection, When `DELETE /users/me/connections/:provider`, Then 409 `LAST_SIGN_IN_METHOD` (chặn tự khoá tài khoản).
- AC-04 (Error handling): Given provider không tồn tại trong danh sách, Then 400 `CONNECTION_NOT_FOUND`.

**Dependencies:** US-AUTH-005.

**Source Traceability:**
```
Backend: users.controller.ts:228-256
Frontend: remotesea-web/src/features/settings (Connected accounts)
```

---

#### [US-AUTH-019] — Quản lý phiên đăng nhập đang hoạt động
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là một **người dùng**, tôi muốn **xem danh sách thiết bị/phiên đang đăng nhập và thu hồi phiên bất kỳ**, để **phát hiện và ngăn truy cập trái phép**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given có nhiều session, When `GET /users/me/sessions`, Then trả danh sách kèm `device` (parse User-Agent), `location` (geoip), `current` flag.
- AC-02 (Revoke 1 session): Given chọn 1 session KHÁC session hiện tại, When `DELETE /users/me/sessions/:id`, Then session đó bị revoke ngay.
- AC-03 (Authorization — không tự huỷ phiên hiện tại): Given `sessionId === current`, Then 400 `CANNOT_REVOKE_CURRENT_SESSION` (nút Revoke cũng bị ẩn ở FE cho session này).
- AC-04 (Revoke all others): When `DELETE /users/me/sessions`, Then revoke mọi session trừ hiện tại, trả `{revokedCount}`.
- AC-05 (Error handling): Given sessionId không tồn tại/đã revoke, Then 404 `SESSION_NOT_FOUND`.

**Dependencies:** US-AUTH-002.

**Source Traceability:**
```
Backend: auth.service.ts:600-627 (listSessions, revokeSession, revokeOtherSessions)
Frontend: remotesea-web/src/features/settings/components/SecuritySection.tsx:102
```

---

#### [US-AUTH-020] — Xoá tài khoản
**Epic:** Auth & Account | **Actor:** Talent / Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 5

> Là một **người dùng**, tôi muốn **xoá vĩnh viễn tài khoản của mình**, để **rời khỏi nền tảng hoàn toàn**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given không có ràng buộc nào, When `DELETE /users/me`, Then tài khoản + dữ liệu liên quan bị xoá (cascade), file resume/logo bị xoá best-effort khỏi storage.
- AC-03 (Business rule — Employer có job active): Given là chủ (`EmployerProfile.userId`) của công ty đang có job ACTIVE, When xoá tài khoản, Then 409 `ACTIVE_JOBS_PREVENT_DELETION`.
- AC-04 (Business rule — còn team obligations): Given công ty còn thành viên khác hoặc lời mời PENDING, Then 409 `ACTIVE_TEAM_PREVENTS_DELETION`.

**Business Rules (Rủi ro nghiệp vụ — cần PO xác nhận):** 2 check trên dựa vào `EmployerProfile.userId` (người **tạo** công ty ban đầu), field này **không bao giờ được cập nhật** kể cả sau khi chuyển giao quyền OWNER (US-TEAM-005). Hệ quả: người sáng lập dù đã rời khỏi công ty hoàn toàn (bị xoá khỏi `CompanyMember`) vẫn có thể bị chặn xoá tài khoản vĩnh viễn nếu công ty đó còn tồn tại job/thành viên khác — vì hệ thống không có khái niệm "current owner", chỉ có "creator". `[NEEDS_VERIFICATION với PO]`: đây là hành vi mong muốn (bảo vệ dữ liệu công ty) hay cần API "transfer creatorship" thật sự?

**Dependencies:** US-AUTH-001, US-TEAM-005.

**Source Traceability:**
```
Backend: users.controller.ts (DELETE users/me); users.service.ts:40-86; users.repository.ts:197-205 (Job.employerId onDelete: RESTRICT)
Frontend: remotesea-web/src/features/settings/components/DeleteAccountButton.tsx (ConfirmAction double-confirm)
```

---

### EPIC 02 — Talent Profile

#### [US-TALENT-001] — Tạo/cập nhật hồ sơ ứng viên
**Epic:** Talent Profile | **Actor:** Talent | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là một **ứng viên**, tôi muốn **tạo và cập nhật hồ sơ của mình (kỹ năng, mong muốn công việc, CV)**, để **nhà tuyển dụng có đủ thông tin đánh giá tôi**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given đã đăng nhập với role TALENT, When `PUT /talent/me` với danh sách skill hợp lệ, Then hồ sơ được upsert, toàn bộ `TalentSkill` cũ bị thay bằng danh sách mới trong 1 transaction.
- AC-02 (Validation): Given `resumeUrl` không đúng định dạng URL, Then 400.
- AC-03 (Authorization — ownership upload): Given `resumeUrl` không phải do chính user này upload qua `/uploads/presign` (kiểm tra prefix theo `{userId}`), Then 400 `UPLOAD_URL_NOT_OWNED`.
- AC-04 (Error handling): Given `User` không tồn tại (edge case), Then 404 `USER_NOT_FOUND`.

**Business Rules:** Resume cũ bị xoá best-effort khỏi storage khi thay resume mới (tránh rác S3).

**Dependencies:** US-AUTH-001 (role=TALENT).

**Source Traceability:**
```
Backend: remotesea-api/src/modules/talent/talent.controller.ts:77-90; talent.service.ts:234-318; talent.repository.ts:160-186
Frontend: remotesea-web/src/features/talent/pages/ProfilePage.tsx; components/profile-form/*.tsx; talent.schemas.ts
```

---

#### [US-TALENT-002] — Xác minh email ứng viên
**Epic:** Talent Profile | **Actor:** Talent | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **ứng viên**, tôi muốn **xác minh email của mình**, để **tăng độ tin cậy của hồ sơ**.

**Acceptance Criteria:**
- AC-01: Given `POST /talent/verification`, Then tạo token 1 giờ, set `verificationStatus=PENDING`.
- AC-02: Given click link email với token hợp lệ, When `POST /talent/verification/confirm`, Then `isVerified=true, verificationStatus=VERIFIED`.
- AC-04 (Error handling): Given token hết hạn/sai, Then 400 `INVALID_OR_EXPIRED_TOKEN`.

**Business Rules:** Khác với Employer verification, **không yêu cầu domain email khớp** gì cả — chỉ cần xác nhận sở hữu email.

**Dependencies:** US-TALENT-001.

**Source Traceability:**
```
Backend: talent.controller.ts:109-138; talent.repository.ts:114-135; constants.ts:8
```

---

#### [US-TALENT-003] — Thiết lập chế độ hiển thị hồ sơ
**Epic:** Talent Profile | **Actor:** Talent | **Priority:** P1 | **Status:** [PARTIAL] | **SP:** 2

> Là một **ứng viên**, tôi muốn **chọn ai được xem hồ sơ của mình (công khai / chỉ nhà tuyển dụng đã xác minh)**, để **kiểm soát quyền riêng tư**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given chọn `visibility = PUBLIC`, Then bất kỳ ai cũng xem được `GET /talent/:slug`.
- AC-02 (Happy path): Given chọn `visibility = VERIFIED_EMPLOYERS`, When 1 EMPLOYER **chưa verify** cố xem, Then 404 `TALENT_PROFILE_NOT_FOUND` (không tiết lộ hồ sơ tồn tại nhưng bị chặn).
- AC-05 (Gap xác nhận): Given UI hiển thị 4 lựa chọn gồm cả "Invited only", When chọn "Invited only", Then **không có xử lý nào được gọi** (dead option, silent no-op) — backend chỉ có 2 giá trị `PUBLIC|VERIFIED_EMPLOYERS`.
- AC-06 (Gap xác nhận): 2 toggle "Show salary expectation" và "Hide from current employer" trong cùng section là **state cục bộ giả**, không gọi API, không persist.

**Dependencies:** US-TALENT-001.

**Definition of Done:** Backend ✅ (2/2 giá trị enum) / Frontend ⚠️ (UI hứa hẹn nhiều hơn backend hỗ trợ) → cần PO quyết định: bỏ option "Invited only" khỏi UI hay làm thêm backend.

**Source Traceability:**
```
Backend: talent.service.ts:128-140; prisma/schema.prisma:119-122
Frontend: remotesea-web/src/features/talent/components/profile-form/VisibilitySection.tsx:72-83
```

---

#### [US-TALENT-004] — Quản lý kinh nghiệm làm việc
**Epic:** Talent Profile | **Actor:** Talent | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên**, tôi muốn **thêm/sửa/xoá các mục kinh nghiệm làm việc**, để **thể hiện quá trình sự nghiệp của mình**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given chưa đủ 5 mục, When `POST /talent/me/experience`, Then tạo mới thành công.
- AC-02 (Business rule): Given đã có 5 mục (`MAX_WORK_EXPERIENCES_PER_PROFILE`), When tạo thêm, Then 409 `WORK_EXPERIENCE_LIMIT_REACHED`.
- AC-03 (Authorization): Given cố sửa/xoá kinh nghiệm của người khác, When `PATCH/DELETE /:id`, Then 404 (không phải 403 — `notFoundOnMismatch: true`, tránh lộ thông tin tồn tại).
- AC-04 (Error handling): Given chưa có `TalentProfile`, When tạo mới, Then 403 `TALENT_PROFILE_REQUIRED`.

**Dependencies:** US-TALENT-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/work-experience/work-experience.controller.ts; work-experience.service.ts:41-49; guards/work-experience-ownership.guard.ts:14
Frontend: remotesea-web/src/features/talent/components/profile-form/ExperienceSection.tsx (MAX_EXPERIENCES=5)
```

---

#### [US-TALENT-005] — Quản lý điểm nhấn hồ sơ (Portfolio/Học vấn/Ngôn ngữ)
**Epic:** Talent Profile | **Actor:** Talent | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên**, tôi muốn **thêm các điểm nhấn (dự án nổi bật, học vấn, ngôn ngữ)**, để **làm nổi bật hồ sơ của mình**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given loại `PORTFOLIO`/`EDUCATION`/`LANGUAGE` với field bắt buộc tương ứng, When `POST /talent/me/highlights`, Then tạo thành công.
- AC-02 (Validation theo loại): Given loại `EDUCATION` thiếu `startYear`, Then 400 (Zod discriminated union). Given `endYear < startYear`, Then 400.
- AC-03 (Business rule): Given đã có 5 mục **của CÙNG loại**, When tạo thêm loại đó, Then 409 `PROFILE_HIGHLIGHT_LIMIT_REACHED` (giới hạn tính riêng từng loại, không phải tổng).
- AC-04 (Authorization): Tương tự US-TALENT-004, sai chủ sở hữu → 404.

**Dependencies:** US-TALENT-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/profile-highlights/*; dto/create-profile-highlight.dto.ts:40-58
Frontend: remotesea-web/src/features/talent/components/profile-form/HighlightsSection.tsx
```

---

#### [US-TALENT-006] — Xem bảng điều khiển ứng viên
**Epic:** Talent Profile | **Actor:** Talent | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên**, tôi muốn **xem tổng quan hồ sơ, đơn ứng tuyển, tin đã lưu, lượt xem hồ sơ và cảnh báo việc làm trong 1 màn hình**, để **theo dõi tiến trình tìm việc nhanh chóng**.

**Acceptance Criteria:**
- AC-01 (Happy path): When `GET /talent/me/dashboard`, Then trả gộp `{profile, applications, stats, saved, profileViews, alerts, invitations, activity}` trong 1 round-trip.
- AC-04 (Error handling từng phần độc lập): Given 1 phần dữ liệu con lỗi (vd profileViews query fail), Then các phần khác vẫn trả về bình thường (mỗi phần catch lỗi riêng qua `nullOnExpectedError`), không làm sập toàn bộ dashboard.

**Dependencies:** US-TALENT-001, US-APP-001, US-JOB-009, US-TALENT-007, US-ALERT-001.

**Source Traceability:**
```
Backend: talent.controller.ts:70-75; talent.service.ts:179-213
Frontend: remotesea-web/src/features/talent/components/TalentDashboard.tsx
```

---

#### [US-TALENT-007] — Xem thống kê lượt xem hồ sơ
**Epic:** Talent Profile | **Actor:** Talent | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **ứng viên**, tôi muốn **biết có bao nhiêu lượt/người xem hồ sơ của mình**, để **đánh giá mức độ thu hút của hồ sơ**.

**Acceptance Criteria:**
- AC-01: When `GET /talent/me/profile-views`, Then trả `{totalViews, uniqueViewers}`.
- AC-02 (Business rule — không lộ danh tính): Response **không bao giờ** chứa `viewerId` hay bất kỳ thông tin nào về người xem cụ thể — chỉ số liệu tổng hợp.
- AC-03 (Business rule — điều kiện đếm): Chỉ lượt xem bởi user có `role=EMPLOYER` mới được tính; xem ẩn danh hoặc bởi TALENT khác không tính.
- AC-04 (Dedup): 1 employer xem lại hồ sơ nhiều lần trong cùng 1 ngày (UTC) chỉ tính 1 view (`@@unique([viewerId, talentId, viewDate])`).

**Dependencies:** US-TALENT-008 (nguồn tạo view).

**Source Traceability:**
```
Backend: remotesea-api/src/modules/profile-views/*; profile-views.service.ts:19-25; schema.prisma:1159
Frontend: TalentDashboard.tsx:214-218
```

---

#### [US-TALENT-008] — Xem hồ sơ công khai của ứng viên
**Epic:** Talent Profile | **Actor:** Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là một **nhà tuyển dụng**, tôi muốn **xem hồ sơ công khai của 1 ứng viên qua slug**, để **đánh giá sự phù hợp trước khi liên hệ**.

**Acceptance Criteria:**
- AC-01 (Happy path — PUBLIC): Given `visibility=PUBLIC`, When `GET /talent/:slug` (không cần đăng nhập), Then trả hồ sơ, tự động ghi nhận 1 `ProfileView` nếu viewer là EMPLOYER (chạy nền, không chặn response).
- AC-02 (Authorization — VERIFIED_EMPLOYERS): Given `visibility=VERIFIED_EMPLOYERS`, When viewer không phải EMPLOYER đã verify, Then 404 (ẩn hoàn toàn).
- AC-03 (Business rule — lương): Given `isOpenToWork=false`, Then `desiredSalaryMin/Max` bị loại khỏi response dù profile công khai.
- AC-05 (Gap ghi nhận): Query param `?preview=recruiter` hiển thị "match score 94%", nút "Add to shortlist/Send message", "Trust signals" — **toàn bộ là dữ liệu mock cứng (`MOCK_RECRUITER`)**, không có backend tương ứng, không nên coi là tính năng thật.

**Dependencies:** US-TALENT-001, US-TALENT-003.

**Source Traceability:**
```
Backend: talent.controller.ts:156-166; talent.service.ts:128-150
Frontend: remotesea-web/src/features/talent/pages/PublicTalentProfilePage.tsx:42-46 (mock data)
```

---

#### [US-TALENT-009] — Tìm kiếm ứng viên
**Epic:** Talent Profile | **Actor:** Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 5

> Là một **nhà tuyển dụng**, tôi muốn **tìm kiếm ứng viên đang mở cơ hội việc làm**, để **chủ động tiếp cận nhân tài phù hợp**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given role=EMPLOYER, When `GET /talent` với bộ lọc, Then trả danh sách ứng viên có `isOpenToWork=true` và visibility phù hợp.
- AC-03 (Authorization): Given role≠EMPLOYER, Then 403 `INSUFFICIENT_ROLE` (`@Roles("EMPLOYER")`).
- AC-04 (Business rule visibility mở rộng): Given caller là EMPLOYER **đã verify**, Then kết quả gồm cả `PUBLIC` lẫn `VERIFIED_EMPLOYERS`; Given EMPLOYER chưa verify, Then chỉ `PUBLIC`.

**Dependencies:** US-TALENT-001, US-EMP-003.

**Source Traceability:**
```
Backend: talent.controller.ts:144-154; talent-search.util.ts
```

---

### EPIC 03 — Employer & Company

#### [US-EMP-001] — Tạo hồ sơ công ty (trở thành Employer)
**Epic:** Employer & Company | **Actor:** Talent → Employer | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **người dùng**, tôi muốn **tạo hồ sơ công ty**, để **bắt đầu đăng tin tuyển dụng**.

**Acceptance Criteria:**
- AC-01 (Happy path): When `POST /employer/profile`, Then trong 1 transaction: `User.role` → `EMPLOYER`, tạo `EmployerProfile` + `CompanyMember{role: OWNER}`.
- AC-03 (Business rule — 1 công ty/user): Given user đã có `EmployerProfile` hoặc đã là `CompanyMember` ở công ty khác, Then 409 `EMPLOYER_PROFILE_ALREADY_EXISTS` hoặc `ALREADY_COMPANY_MEMBER`.
- AC-04 (Slug generation): Given tên công ty không transliterate được (CJK/tiếng Việt có dấu đặc biệt), Then hệ thống tự thêm suffix để đảm bảo slug unique, retry khi đụng race condition (P2002).

**Business Rules:** Route này **không có `@Roles("EMPLOYER")`** — chính hành động này mới là bước "trở thành employer", không phải điều kiện tiên quyết.

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: employer.controller.ts:139-144; employer.service.ts:105-160; employer.repository.ts:163-197
Frontend: remotesea-web/src/features/post-job/components/PostJobWizard.tsx (StepCompany, tạo idempotent trong luồng đăng tin)
```

---

#### [US-EMP-002] — Cập nhật hồ sơ công ty
**Epic:** Employer & Company | **Actor:** Employer (Owner) | **Priority:** P1 | **Status:** [PARTIAL] | **SP:** 3

> Là **chủ công ty (OWNER)**, tôi muốn **cập nhật thông tin công ty (mô tả, website, logo)**, để **hồ sơ công ty luôn cập nhật và chuyên nghiệp**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given là OWNER, When `PATCH /employer/profile`, Then cập nhật thành công.
- AC-03 (Authorization): Given không phải OWNER (vd RECRUITER), Then 403 (`OWNER_ONLY`).
- AC-04 (Authorization — upload ownership): Given `logoUrl` không phải URL do chính user này upload, Then 400 `UPLOAD_URL_NOT_OWNED`.
- AC-05 (Gap xác nhận): **Không tồn tại UI nào** để upload/sửa logo công ty trong toàn bộ frontend — `CompanyProfilePage.tsx` chỉ hiển thị logo, nút "Edit" dẫn tới dashboard không có form sửa công ty nào chứa field logo.

**Dependencies:** US-EMP-001.

**Definition of Done:** Backend ✅ / Frontend ❌ (logo) → **GAP cần làm**: chưa có form/route cho phép OWNER thật sự đổi logo công ty dù toàn bộ pipeline backend (presign, validate, persist) đã sẵn sàng.

**Source Traceability:**
```
Backend: employer.controller.ts:162-193; employer.service.ts (updateProfile, OWNER_ONLY)
Frontend: remotesea-web/src/features/employer/pages/CompanyProfilePage.tsx (chỉ display); employer.queries.ts (không có useUpdateEmployerProfile)
```

---

#### [US-EMP-003] — Xác minh công ty qua email domain
**Epic:** Employer & Company | **Actor:** Employer (Owner) | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là **chủ công ty**, tôi muốn **xác minh công ty bằng email trùng domain website**, để **có huy hiệu Verified và tăng độ tin cậy**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `websiteUrl` đã thiết lập và email domain khớp website, When `POST /employer/verification` rồi confirm token, Then `isVerified=true`.
- AC-02 (Validation): Given chưa có `websiteUrl`, Then 400 `EMPLOYER_WEBSITE_REQUIRED`.
- AC-03 (Validation): Given email không cùng domain với website, Then 400 `EMPLOYER_VERIFICATION_DOMAIN_MISMATCH`.
- AC-05 (Business impact — đã xác nhận chéo với US-JOB-004): Công ty đã verify là 1 trong 4 điều kiện để job được **tự động duyệt** (bỏ qua admin review) — xem `isEligibleForAutoApproval`.

**Business Rules:** Token TTL 24 giờ. Tồn tại song song với US-ADM-EMP-001 (admin verify thủ công) — 2 cơ chế không đồng bộ field `verificationStatus` (xem Gap Analysis).

**Dependencies:** US-EMP-001.

**Source Traceability:**
```
Backend: employer.controller.ts:527-555; employer.service.ts:297-342; job-verification.util.ts:14-24
Frontend: remotesea-web/src/features/employer/pages/EmployerVerifyPage.tsx; components/employer-dashboard/VerifyCompanyBanner.tsx
```

---

#### [US-EMP-004] — Xem hồ sơ công ty công khai
**Epic:** Employer & Company | **Actor:** Talent / Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là một **khách truy cập**, tôi muốn **xem trang công ty công khai**, để **tìm hiểu về nhà tuyển dụng trước khi ứng tuyển**.

**Acceptance Criteria:**
- AC-01: When `GET /companies/:slug` (không cần đăng nhập), Then trả thông tin công ty + `avgFirstResponseHours` (nếu đủ mẫu tối thiểu) như tín hiệu tin cậy.
- AC-02 (Error handling): Given slug không tồn tại, Then "Company not found" + CTA.

**Dependencies:** US-EMP-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/employer/companies.controller.ts; employer.service.ts:195-210
Frontend: remotesea-web/src/features/employer/pages/CompanyProfilePage.tsx
```

---

#### [US-EMP-005] — Xem bảng điều khiển nhà tuyển dụng
**Epic:** Employer & Company | **Actor:** Employer (mọi vai trò) | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **thành viên công ty**, tôi muốn **xem tổng quan job đang đăng, đơn ứng tuyển và số liệu SLA phản hồi**, để **quản lý hoạt động tuyển dụng hiệu quả**.

**Acceptance Criteria:**
- AC-01: When `GET /employer/dashboard`, Then trả `{profile, stats, avgFirstResponseHours, jobs}`.
- AC-04 (Authorization): Given account suspended (`suspendedAt` set), Then 403 `COMPANY_SUSPENDED` cho mọi hành động cấp company-role.

**Dependencies:** US-EMP-001, US-JOB-001.

**Source Traceability:**
```
Backend: employer.controller.ts; employer.service.ts:203-209,382-397; employer.repository.ts:384-432
```

---

### EPIC 04 — Team Membership & Invitations

#### [US-TEAM-001] — Mời thành viên vào công ty
**Epic:** Team Management | **Actor:** Employer (Owner) | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là **chủ công ty (OWNER)**, tôi muốn **mời người khác vào công ty với vai trò cụ thể**, để **phân chia công việc tuyển dụng cho đội nhóm**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given là OWNER, When `POST /team/invitations` với email + role ∈ {RECRUITER, HIRING_MANAGER, INTERVIEWER}, Then tạo `TeamInvitation` PENDING, TTL 7 ngày, gửi email.
- AC-03 (Authorization): Given không phải OWNER, Then 403.
- AC-04 (Validation — không thể mời OWNER): Given `role="OWNER"` trong lời mời, Then 400 validation (chỉ promote lên OWNER được sau khi đã gia nhập, không mời thẳng).
- AC-05 (Rate limit): 20 lần/60s.

**Dependencies:** US-EMP-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/team/team.controller.ts; team.service.ts:38-46; team/dto/invite-member.dto.ts (loại trừ OWNER)
Frontend: remotesea-web/src/features/team/components/InviteMemberSection.tsx (INVITABLE_ROLES, dòng 40-44)
```

---

#### [US-TEAM-002] — Chấp nhận lời mời gia nhập công ty
**Epic:** Team Management | **Actor:** Talent / Employer (được mời) | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là **người được mời**, tôi muốn **chấp nhận lời mời gia nhập công ty**, để **trở thành thành viên với vai trò được giao**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given đã đăng nhập với email khớp lời mời, When `POST /team/invitations/accept`, Then transaction: invitation → ACCEPTED, tạo `CompanyMember`, `User.role` → `EMPLOYER`.
- AC-02 (Preview trước khi login): Given chưa đăng nhập, When `GET /team/invitations/:token` (public), Then vẫn xem được thông tin lời mời (tên công ty, vai trò) để quyết định đăng nhập/đăng ký.
- AC-03 (Authorization — email mismatch): Given email tài khoản đang đăng nhập KHÁC email được mời, Then 403 `TEAM_INVITATION_EMAIL_MISMATCH` (chặn forward link).
- AC-04 (Business rule): Given user đã thuộc công ty khác, Then 409 `ALREADY_COMPANY_MEMBER`.
- AC-05 (Error handling): Given token hết hạn hoặc đã ACCEPTED trước đó (CAS chặn double-accept), Then lỗi tương ứng.

**Dependencies:** US-TEAM-001.

**Source Traceability:**
```
Backend: team.controller.ts; team.service.ts:188-249; team.repository.ts:128-148; constants.ts:12
Frontend: remotesea-web/src/features/team/pages/TeamInvitePage.tsx (3 trạng thái: chưa login / sai email / accepted)
```

---

#### [US-TEAM-003] — Xem danh sách thành viên công ty
**Epic:** Team Management | **Actor:** Employer (mọi vai trò) | **Priority:** P1 | **Status:** Implemented | **SP:** 1

> Là một **thành viên công ty**, tôi muốn **xem toàn bộ đội nhóm**, để **biết ai đang phụ trách việc gì**.

**Acceptance Criteria:**
- AC-01: When `GET /team/members`, Then mọi seat trong công ty (bất kỳ role nào) đều xem được danh sách.

**Dependencies:** US-TEAM-001.

**Source Traceability:**
```
Backend: team.service.ts:48-61 (ALL_COMPANY_ROLES)
Frontend: remotesea-web/src/features/team/components/TeamMembersSection.tsx
```

---

#### [US-TEAM-004] — Thu hồi lời mời đang chờ
**Epic:** Team Management | **Actor:** Employer (Owner) | **Priority:** P2 | **Status:** Implemented | **SP:** 1

> Là **OWNER**, tôi muốn **thu hồi lời mời chưa được chấp nhận**, để **huỷ quyền truy cập nếu mời nhầm hoặc đổi ý**.

**Acceptance Criteria:**
- AC-01: Given lời mời đang PENDING, When `DELETE /team/invitations/:id`, Then lời mời bị vô hiệu hoá, link cũ không dùng được nữa.
- AC-03 (Authorization): Chỉ OWNER.

**Dependencies:** US-TEAM-001.

**Source Traceability:**
```
Backend: team.controller.ts (DELETE invitations/:id), requireOwner
```

---

#### [US-TEAM-005] — Đổi vai trò thành viên / Chuyển giao quyền OWNER
**Epic:** Team Management | **Actor:** Employer (Owner) | **Priority:** P1 | **Status:** Implemented | **SP:** 5

> Là **OWNER**, tôi muốn **đổi vai trò của thành viên khác (kể cả promote lên OWNER)**, để **phân quyền lại đội nhóm hoặc chuyển giao quyền sở hữu công ty**.

**Acceptance Criteria:**
- AC-01 (Happy path — đổi role thường): Given target là RECRUITER, When `PATCH /team/members/:id` với `role=HIRING_MANAGER`, Then cập nhật thành công.
- AC-02 (Chuyển giao OWNER — quy trình 2 bước, không có API riêng): Bước 1 promote người khác lên `OWNER`; bước 2 tự hạ role của chính mình — không có endpoint "transfer ownership" chuyên biệt.
- AC-03 (Business rule — bảo vệ OWNER cuối cùng): Given công ty chỉ còn đúng 1 OWNER, When hạ role chính OWNER đó, Then 400 `CANNOT_REMOVE_LAST_OWNER`.
- AC-04 (Authorization): Chỉ OWNER của **đúng công ty chứa member đó** (`CompanyMemberOwnershipGuard`).
- AC-05 (Gap ghi nhận): Rate limit `UPDATE_MEMBER_ROLE` được khai báo trong constants nhưng **không được gắn vào route** — route này hiện không bị giới hạn tần suất.

**Business Rules:** Có thể tồn tại tạm thời NHIỀU hơn 1 OWNER trong lúc chuyển giao (không bị chặn) — chỉ chặn xuống còn 0.

**Dependencies:** US-TEAM-002.

**Source Traceability:**
```
Backend: team.controller.ts (PATCH members/:id); team.service.ts:251-267; team/dto/update-member-role.dto.ts:4; team/constants.ts:4-5 (rate limit khai báo, không dùng)
Frontend: remotesea-web/src/features/team/components/TeamMembersSection.tsx (ASSIGNABLE_ROLES gồm cả OWNER, dòng 19-24)
```

---

#### [US-TEAM-006] — Xoá thành viên khỏi công ty
**Epic:** Team Management | **Actor:** Employer (Owner) | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là **OWNER**, tôi muốn **xoá 1 thành viên khỏi công ty**, để **thu hồi quyền truy cập khi họ không còn làm việc cùng**.

**Acceptance Criteria:**
- AC-01: When `DELETE /team/members/:id`, Then `CompanyMember` bị xoá.
- AC-03 (Business rule): Given target là OWNER cuối cùng, Then 400 `CANNOT_REMOVE_LAST_OWNER`.
- AC-04 (Authorization): `CompanyMemberOwnershipGuard`.

**Dependencies:** US-TEAM-002.

**Source Traceability:**
```
Backend: team.controller.ts (DELETE members/:id)
```

---

### EPIC 05 — Job Management

#### [US-JOB-001] — Tạo tin tuyển dụng (nháp)
**Epic:** Job Management | **Actor:** Employer (Owner / Recruiter) | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là **OWNER hoặc RECRUITER**, tôi muốn **tạo tin tuyển dụng ở trạng thái nháp**, để **chuẩn bị nội dung trước khi thanh toán đăng tin**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `title` 5-120 ký tự, `description` 100-20000 ký tự, `categoryIds` 1-3, When `POST /jobs`, Then tạo Job `status=DRAFT`, sinh `slug` unique.
- AC-03 (Authorization): Given company role KHÔNG thuộc `{OWNER, RECRUITER}` (vd HIRING_MANAGER/INTERVIEWER), Then 403 (check trong service, không phải Guard cấp route).
- AC-03b (Authorization — company suspended): Given công ty bị đình chỉ, Then 403 `COMPANY_SUSPENDED`.
- AC-04 (Validation): Given `categoryIds` rỗng hoặc >3, hoặc `description` <100 ký tự, Then 400.

**Business Rules:** Không có endpoint "submit for review" riêng — DRAFT chỉ chuyển trạng thái tiếp qua thanh toán (US-JOB-003).

**Dependencies:** US-EMP-001, US-TAXO-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/jobs/jobs.controller.ts:77-93; jobs.service.ts:175-200; company-role.util.ts:11-14 (JOB_MANAGEMENT_ROLES); dto/create-job.dto.ts
Frontend: remotesea-web/src/features/post-job/components/PostJobWizard.tsx (wizard 4 bước); use-post-job-draft.ts (autosave localStorage)
```

---

#### [US-JOB-002] — Chỉnh sửa tin tuyển dụng
**Epic:** Job Management | **Actor:** Employer (Owner / Recruiter) / Admin | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là **OWNER/RECRUITER**, tôi muốn **sửa nội dung tin khi còn ở trạng thái nháp hoặc bị từ chối**, để **hoàn thiện trước khi đăng lại**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `job.status ∈ {DRAFT, REJECTED}`, When `PATCH /jobs/:id`, Then cập nhật thành công.
- AC-03 (Authorization/Business rule): Given `job.status` là `PENDING_REVIEW/ACTIVE/CLOSED/EXPIRED`, Then 403 `JOB_NOT_EDITABLE` — **kể cả ADMIN cũng không sửa được job trong các trạng thái này** trừ khi qua route riêng của admin.
- AC-03b: ADMIN được bypass check ownership (nhưng vẫn phải đúng trạng thái editable).

**Dependencies:** US-JOB-001.

**Source Traceability:**
```
Backend: jobs.service.ts:202-239; guards/job-ownership.guard.ts
```

---

#### [US-JOB-003] — Thanh toán để đăng tin
**Epic:** Job Management | **Actor:** Employer (Owner) | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là **OWNER**, tôi muốn **thanh toán qua Stripe để đăng tin lên hệ thống**, để **tin của tôi được xét duyệt và hiển thị công khai**.

*(Chi tiết đầy đủ tại US-BILL-001 — đây là góc nhìn "job lifecycle" của cùng 1 luồng.)*

**Acceptance Criteria:**
- AC-01 (Happy path): Given `job.status=DRAFT && !planPaid`, When `POST /billing/checkout`, Then tạo Stripe Checkout Session, giá theo `PLAN_PRICES[planType]` (STANDARD $150 / FEATURED $350 / HANDS_ON $1200), redirect tới Stripe.
- AC-03 (Authorization): Chỉ **OWNER** (không phải RECRUITER) được thanh toán — `JobPayerOwnershipGuard` (`OWNER_ONLY`).
- AC-04 (Business rule): Given job đã `planPaid=true` hoặc không còn DRAFT, Then 400 `JOB_NOT_PAYABLE`.
- AC-05 (Idempotency): Given bấm thanh toán 2 lần liên tiếp cho cùng job, Then trả về cùng 1 Stripe session (idempotency key `checkout:{jobId}`), không tạo phiên trùng.

**Business Rules:** KHÔNG có gói miễn phí — mọi `PlanType` đều tính phí. Circuit breaker: 5 lần lỗi Stripe liên tiếp trong 30s → tạm thời trả 503 nhanh thay vì tiếp tục gọi Stripe.

**Dependencies:** US-JOB-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/billing/billing.controller.ts:36-51; billing.service.ts:55-114; guards/job-payer-ownership.guard.ts; common/constants/plan.constants.ts
Frontend: remotesea-web/src/features/post-job/components/PostJobWizard.tsx:158-190; pages/PostJobSuccessPage.tsx
```

---

#### [US-JOB-004] — Tự động duyệt tin đủ điều kiện
**Epic:** Job Management | **Actor:** System | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là **hệ thống**, khi thanh toán thành công tôi muốn **tự động duyệt (ACTIVE) những tin đạt đủ tiêu chuẩn chất lượng**, để **rút ngắn thời gian chờ cho nhà tuyển dụng uy tín, giảm tải hàng đợi cho admin**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given Stripe webhook `checkout.session.completed` xác nhận thanh toán VÀ employer `isVerified=true` VÀ `description.length≥100` VÀ có `salaryMin` VÀ ≥1 category, Then job chuyển thẳng `PENDING_REVIEW → ACTIVE`, set `publishedAt=now`, `expiresAt` theo `PLAN_DURATION_DAYS[planType]`.
- AC-02 (Ngược lại): Given không đủ 4 điều kiện trên, Then job dừng ở `PENDING_REVIEW`, chờ admin duyệt thủ công (US-ADM-JOB-002).
- AC-04 (Error handling — reconciliation): Given webhook xử lý dở dang do crash (job stuck `PENDING_REVIEW`+`planPaid=true` >10 phút), Then cron `GET /billing/cron/reconcile` tự đánh giá lại và duyệt nếu đủ điều kiện.
- AC-05 (Idempotency): Given webhook Stripe gửi lại (retry), Then không xử lý 2 lần (điều kiện `planPaid=false` trong `updateMany` chặn).

**Business Rules (Gap ghi nhận):** Hành động tự động duyệt **không được ghi vào `AdminAuditLog`** (vì không có admin actor) — đây là điểm mù trong audit trail.

**Dependencies:** US-JOB-003, US-EMP-003.

**Source Traceability:**
```
Backend: jobs/job-verification.util.ts:14-24; billing.service.ts:116-257; jobs.repository.ts:206-238 (approveJob)
```

---

#### [US-JOB-005] — Đóng tin tuyển dụng
**Epic:** Job Management | **Actor:** Employer (Owner / Recruiter) / Admin | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là **OWNER/RECRUITER**, tôi muốn **chủ động đóng tin đang active**, để **ngừng nhận thêm ứng viên khi đã tuyển đủ**.

**Acceptance Criteria:**
- AC-01: Given `job.status=ACTIVE`, When `PATCH /jobs/:id/close`, Then `status=CLOSED` (atomic CAS).
- AC-03 (Business rule — gap ghi nhận): Đóng job **không** ảnh hưởng gì tới các `Application` đang tồn tại của job đó — chúng giữ nguyên trạng thái, không tự động reject/withdraw, không thông báo cho ứng viên.

**Dependencies:** US-JOB-004.

**Source Traceability:**
```
Backend: jobs.service.ts:246-264; jobs.repository.ts:187-197
```

---

#### [US-JOB-006] — Tin tuyển dụng tự hết hạn
**Epic:** Job Management | **Actor:** System (cron) | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là **hệ thống**, tôi muốn **tự động chuyển các tin đã quá hạn (`expiresAt`) sang `EXPIRED`**, để **giữ trang tìm việc chỉ hiển thị tin còn hiệu lực**.

**Acceptance Criteria:**
- AC-01: Given `job.status=ACTIVE && expiresAt < now()`, When `GET /jobs/cron/expire` được gọi, Then job chuyển `EXPIRED` (updateMany hàng loạt).
- AC-03 (Authorization): Guard bằng `CronSecretGuard` (Bearer secret) — không phải JWT người dùng.
- AC-05 (Gap `[NEEDS_VERIFICATION]`): Không tìm thấy cấu hình lịch gọi endpoint này (không có cron config trong 2 repo) — tần suất gọi thực tế phụ thuộc hệ thống điều phối bên ngoài, ngoài phạm vi source code.

**Dependencies:** US-JOB-004.

**Source Traceability:**
```
Backend: jobs.controller.ts:95-103; jobs.repository.ts:264-271
```

---

#### [US-JOB-007] — Tìm kiếm & lọc tin tuyển dụng
**Epic:** Job Management | **Actor:** Talent / Employer | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là một **người tìm việc**, tôi muốn **tìm kiếm và lọc tin tuyển dụng theo từ khoá, loại hình, cấp bậc, ngành nghề, mức lương**, để **nhanh chóng tìm được công việc phù hợp**.

**Acceptance Criteria:**
- AC-01 (Happy path): When `GET /jobs?q=...&type=...&category=...`, Then trả danh sách job `ACTIVE` + `publishedAt≤now` + (`expiresAt` null hoặc còn hạn), có phân trang.
- AC-02 (Full-text search): Given `q` có giá trị, Then search dùng Postgres `tsvector`/`websearch_to_tsquery`.
- AC-03 (Filter taxonomy): Given `category` = slug, Then lọc theo `JobCategory`. **Gap xác nhận:** KHÔNG có filter theo `skill` ở endpoint này (chỉ category).
- AC-04 (Public, không auth): Route công khai, cache CDN 60s, rate limit 60 req/phút/IP.

**Dependencies:** US-JOB-004, US-TAXO-001.

**Source Traceability:**
```
Backend: jobs.controller.ts:58-75; dto/list-jobs.dto.ts; job-search.util.ts
Frontend: remotesea-web/src/features/jobs (search/filter UI)
```

---

#### [US-JOB-008] — Xem chi tiết tin tuyển dụng
**Epic:** Job Management | **Actor:** Talent / Employer | **Priority:** P0 | **Status:** Implemented | **SP:** 2

> Là một **người tìm việc**, tôi muốn **xem chi tiết 1 tin tuyển dụng**, để **quyết định có ứng tuyển hay không**.

**Acceptance Criteria:**
- AC-01: When `GET /jobs/:id` (theo **id**, không phải slug), Then trả chi tiết job đang `ACTIVE`, tăng viewCount (buffer).
- AC-04 (**BUG xác nhận, có file:line**): Email "Your job is live" dựng link bằng `job.slug` (`email.service.ts:~149`, `` `${appUrl}/jobs/${jobSlug}` ``) nhưng route/API detail chỉ nhận **id** (`jobs.controller.ts:105-109`, `routes.ts:9`) → **link trong email sẽ trả 404** trừ khi slug trùng ngẫu nhiên với id (không bao giờ trùng). Cần fix: đổi email dùng `job.id`, hoặc đổi route detail chấp nhận cả slug.

**Dependencies:** US-JOB-004.

**Source Traceability:**
```
Backend: jobs.controller.ts:105-109; jobs.repository.ts:108-114; remotesea-api/src/common/services/email.service.ts (~line 149)
Frontend: remotesea-web/src/constants/routes.ts:9; features/jobs/pages/job-detail/*
```

---

#### [US-JOB-009] — Lưu / Bỏ lưu tin tuyển dụng
**Epic:** Job Management | **Actor:** Talent / Employer (đã đăng nhập) | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **người dùng đã đăng nhập**, tôi muốn **lưu tin tuyển dụng quan tâm để xem lại sau**, để **không bỏ lỡ cơ hội phù hợp**.

**Acceptance Criteria:**
- AC-01 (Happy path — idempotent): When `PUT /saved/:jobId`, Then lưu (upsert, gọi lại không lỗi).
- AC-02 (Bỏ lưu — idempotent): When `DELETE /saved/:jobId`, Then bỏ lưu (deleteMany, không lỗi nếu chưa từng lưu).
- AC-04 (Optimistic UI): Given bấm nút lưu, Then UI cập nhật ngay lập tức (optimistic), rollback nếu request lỗi.
- AC-05 (Gap ghi nhận): Route **không giới hạn theo role** — tài khoản EMPLOYER cũng gọi được API lưu job (không có ý nghĩa nghiệp vụ rõ ràng nhưng không bị chặn).

**Dependencies:** US-JOB-004, US-AUTH-002.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/saved/saved.controller.ts; saved.repository.ts
Frontend: remotesea-web/src/features/saved/saved.queries.ts:56-154 (optimistic + rollback); features/jobs/useSavedJobToggle.ts
```

---

#### [US-JOB-010] — Xem điểm phù hợp với công việc
**Epic:** Job Management | **Actor:** Talent | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên**, tôi muốn **thấy điểm phù hợp (%) giữa hồ sơ của tôi và 1 tin tuyển dụng**, để **ưu tiên ứng tuyển vào công việc phù hợp nhất**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given role=TALENT và có ≥1 skill trong hồ sơ, Then hiển thị match score tính từ: skills(30) + seniority(20) + salary(10) + location(20) + employmentType(10) + availability(10).
- AC-02 (Điều kiện ẩn): Given chưa có skill nào trong hồ sơ, Then không hiển thị badge match score (trả `null`).
- AC-04 (Kiến trúc — quan trọng cho backlog): Đây là tính toán **100% phía client**, KHÔNG có module/endpoint backend nào — chủ đích để không phá cache CDN của `GET /jobs` (comment code giải thích rõ).

**Dependencies:** US-TALENT-001, US-JOB-007.

**Source Traceability:**
```
Frontend: remotesea-web/src/features/matching/match.util.ts:1-258; useMyMatch.ts:19-30
```

---

### EPIC 06 — Taxonomy

#### [US-TAXO-001] — Xem danh mục ngành nghề
**Epic:** Taxonomy | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 1

> Là một **người dùng**, tôi muốn **xem danh sách ngành nghề/danh mục**, để **lọc/gắn thẻ tin tuyển dụng và hồ sơ**.

**Acceptance Criteria:**
- AC-01: When `GET /categories`, Then trả toàn bộ danh mục, cache 5 phút, không phân trang (dữ liệu ít thay đổi).

**Business Rules `[NEEDS_VERIFICATION]`:** Không tìm thấy CRUD admin cho category/skill trong phạm vi đã khảo sát — nhiều khả năng là dữ liệu seed-only, cần xác nhận thêm nếu backlog cần tính năng "admin quản lý taxonomy".

**Dependencies:** Không.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/taxonomy/categories.controller.ts:1-20
```

---

#### [US-TAXO-002] — Tìm kiếm kỹ năng
**Epic:** Taxonomy | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 1

> Là một **người dùng**, tôi muốn **tìm kiếm kỹ năng theo tên**, để **gắn kỹ năng vào hồ sơ hoặc tin tuyển dụng**.

**Acceptance Criteria:**
- AC-01: When `GET /skills?q=react`, Then trả tối đa 100 kết quả khớp (contains, không phân biệt hoa thường), bỏ qua cache khi có `q` (tránh cache phình vô hạn).
- AC-02: Given không có `q`, Then trả toàn bộ danh sách, cache 5 phút.

**Dependencies:** Không.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/taxonomy/skills.controller.ts:1-24; taxonomy.service.ts:29-47
```

---

### EPIC 07 — Applications

#### [US-APP-001] — Ứng tuyển vào tin tuyển dụng
**Epic:** Applications | **Actor:** Talent | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là một **ứng viên**, tôi muốn **ứng tuyển vào 1 tin tuyển dụng, có thể đính kèm CV riêng cho lần ứng tuyển này**, để **thể hiện sự quan tâm và được nhà tuyển dụng xem xét**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given job đang `ACTIVE`, When `POST /applications` (hoặc route tương ứng) với `jobId`, Then tạo `Application{status: PENDING}`, ghi `ApplicationStatusEvent` đầu tiên.
- AC-02 (Resume override): Given đính kèm `resumeUrl` mới qua upload, When apply, Then `Application.resumeUrl` lưu riêng (khác `TalentProfile.resumeUrl` mặc định) — validate ownership qua `isOwnedUploadUrl`.
- AC-03 (Authorization — upload): Given `resumeUrl` không do chính user này upload, Then 400 `UPLOAD_URL_NOT_OWNED`.

**Dependencies:** US-TALENT-001, US-JOB-008.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/applications/applications.service.ts:133-147 (resume override)
Frontend: remotesea-web/src/features/jobs/components/ApplyButton.tsx:141-153
```

---

#### [US-APP-002] — Xem chi tiết đơn & dòng thời gian trạng thái
**Epic:** Applications | **Actor:** Talent | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên**, tôi muốn **xem chi tiết đơn ứng tuyển của mình và toàn bộ lịch sử thay đổi trạng thái**, để **theo dõi tiến trình tuyển dụng minh bạch**.

**Acceptance Criteria:**
- AC-01: When `GET /applications/:id`, Then trả đơn kèm `statusEvents` (toàn bộ `ApplicationStatusEvent`, dùng cho "Application Transparency" timeline).
- AC-02 (Frontend timeline): Main track hiển thị `[REVIEWING, SHORTLISTED, INTERVIEW, OFFERED]` + bước cuối tuỳ kết quả (`OFFER_ACCEPTED/OFFER_DECLINED/REJECTED/WITHDRAWN`), cộng 2 bước không thuộc `ApplicationStatus`: "Applied" (`appliedAt`) và "Viewed by employer" (`viewedAt`).
- AC-03 (Authorization): Chỉ chủ đơn (`talentId` khớp user hiện tại).

**Dependencies:** US-APP-001.

**Source Traceability:**
```
Backend: applications/interfaces.ts (ownApplicationSelect); applications.repository.ts:120-131
Frontend: remotesea-web/src/features/talent/components/talent-dashboard/ApplicationTimeline.tsx; talent-dashboard.utils.ts:70-100
```

---

#### [US-APP-003] — Rút đơn ứng tuyển
**Epic:** Applications | **Actor:** Talent | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là một **ứng viên**, tôi muốn **rút đơn ứng tuyển đã nộp**, để **ngừng tham gia quy trình tuyển dụng nếu đổi ý**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `status ∈ {PENDING, REVIEWING, SHORTLISTED, INTERVIEW}` (`WITHDRAWABLE_STATUSES`), When `PATCH /applications/:id/withdraw`, Then `status → WITHDRAWN` (CAS atomic), gửi notification `APPLICATION_WITHDRAWN` cho employer.
- AC-03 (Business rule — loại trừ có chủ đích): Given `status = OFFERED`, Then **KHÔNG được rút** — phải dùng route offer-response (US-APP-004) vì một khi đã có offer thì chỉ có thể accept/decline, không rút.
- AC-04 (Race condition): Given trạng thái đã đổi bởi request khác trước đó (CAS thất bại), Then 409 `APPLICATION_UPDATE_CONFLICT`.

**Dependencies:** US-APP-001.

**Source Traceability:**
```
Backend: applications.controller.ts:116-126; applications/constants.ts:14-19; applications.repository.ts:232-254
Frontend: remotesea-web/src/features/applications/pages/ApplicationDetailPage.tsx (nút Withdraw chỉ hiện đúng theo WITHDRAWABLE_STATUSES)
```

---

#### [US-APP-004] — Phản hồi lời mời làm việc (Accept/Decline Offer)
**Epic:** Applications | **Actor:** Talent | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên nhận được lời mời làm việc**, tôi muốn **chấp nhận hoặc từ chối offer**, để **xác nhận quyết định cuối cùng của mình**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `status = OFFERED`, When `PATCH /applications/:id/offer-response` với `{response: "ACCEPTED"|"DECLINED"}`, Then `status → OFFER_ACCEPTED` hoặc `OFFER_DECLINED` (CAS atomic), gửi notification tương ứng cho employer.
- AC-03 (Business rule quan trọng): Đây là route **tách biệt hoàn toàn** khỏi bảng `ALLOWED_TRANSITIONS` của employer — `OFFER_ACCEPTED`/`OFFER_DECLINED` không bao giờ là target hợp lệ trong bảng transition mà employer dùng (US-EMPAPP-002); chỉ route này mới đưa đơn tới 2 trạng thái đó.
- AC-04 (Error handling): Given `status ≠ OFFERED` (kể cả do race condition — CAS lại 1 lần nữa trong repo), Then lỗi tương ứng.

**Dependencies:** US-EMPAPP-002 (đơn phải đạt `OFFERED` trước).

**Source Traceability:**
```
Backend: applications.controller.ts:128-142; applications.service.ts:317-384; applications.repository.ts:260-283; prisma/schema.prisma:42-45 (comment)
Frontend: ApplicationDetailPage.tsx:260-294 (nút Accept/Decline + ConfirmAction)
```

---

#### [US-EMPAPP-001] — Xem danh sách ứng viên của 1 job
**Epic:** Applications | **Actor:** Employer (Owner / Recruiter / Hiring Manager / Interviewer được gán) | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là **nhà tuyển dụng**, tôi muốn **xem danh sách ứng viên đã nộp đơn vào tin của mình**, để **sàng lọc và ra quyết định tuyển dụng**.

**Acceptance Criteria:**
- AC-01: When `GET /employer/applications` (hoặc theo job), Then trả danh sách trong phạm vi công ty của caller.
- AC-03 (Authorization — 2 tầng guard khác nhau tuỳ route): Route xem chi tiết/hợp tác dùng `ApplicationAccessGuard` (cho phép cả INTERVIEWER được gán); route đổi trạng thái/đề xuất phỏng vấn dùng `ApplicationOwnershipGuard` (chỉ OWNER/RECRUITER/HIRING_MANAGER, không có ngoại lệ INTERVIEWER).

**Dependencies:** US-JOB-001, US-APP-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/employer/guards/{application-ownership,application-access}.guard.ts; company-role.util.ts:15-19 (APPLICATION_REVIEW_ROLES)
```

---

#### [US-EMPAPP-002] — Cập nhật trạng thái đơn ứng tuyển
**Epic:** Applications | **Actor:** Employer (Owner / Recruiter / Hiring Manager) | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là **nhà tuyển dụng**, tôi muốn **cập nhật trạng thái đơn ứng tuyển theo đúng quy trình tuyển dụng**, để **theo dõi và điều phối pipeline tuyển dụng**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given transition hợp lệ theo bảng dưới, When `PATCH /employer/applications/:id`, Then cập nhật `status`, ghi `ApplicationStatusEvent`, gửi notification `APPLICATION_STATUS_CHANGED` (+ email nếu bật preference).
  ```
  PENDING → {REVIEWING, REJECTED}
  REVIEWING → {SHORTLISTED, REJECTED}
  SHORTLISTED → {INTERVIEW, REJECTED}
  INTERVIEW → {OFFERED, REJECTED}
  OFFERED → {REJECTED}
  OFFER_ACCEPTED / OFFER_DECLINED / REJECTED / WITHDRAWN → [] (terminal)
  ```
- AC-02 (Validation — invalid transition): Given target không nằm trong danh sách cho phép của trạng thái hiện tại (vd PENDING → OFFERED), Then 400 `INVALID_STATUS_TRANSITION`. Employer **không bao giờ** set được `OFFER_ACCEPTED`/`OFFER_DECLINED` qua route này.
- AC-03 (Authorization): `ApplicationOwnershipGuard` — chỉ OWNER/RECRUITER/HIRING_MANAGER.
- AC-04 (Race condition): Given trạng thái đã bị đổi bởi request khác (CAS: `update where status=expectedStatus`), Then 409 `APPLICATION_UPDATE_CONFLICT`.
- AC-05 (Notes-only save): Given chỉ đổi `notes` mà không đổi `status`, Then **không** ghi `ApplicationStatusEvent` mới.

**Dependencies:** US-APP-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/employer/constants.ts:36-49 (ALLOWED_TRANSITIONS); employer.service.ts:488-556; employer.repository.ts:698-721
Frontend: remotesea-web/src/features/employer/employer.queries.ts:292-332 (useUpdateApplicationStatus, không có optimistic update)
```

---

#### [US-EMPAPP-003] — Cập nhật hàng loạt trạng thái đơn
**Epic:** Applications | **Actor:** Employer (Owner / Recruiter / Hiring Manager) | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là **nhà tuyển dụng**, tôi muốn **cập nhật trạng thái cho nhiều đơn cùng lúc**, để **xử lý nhanh khi có nhiều ứng viên cùng giai đoạn**.

**Acceptance Criteria:**
- AC-01 (Happy path): When `PATCH /employer/applications/bulk`, Then mỗi item được kiểm tra `ALLOWED_TRANSITIONS` riêng, cập nhật atomic bằng 1 câu raw SQL `UPDATE ... FROM (VALUES ...)`.
- AC-02 (Kết quả từng phần): Response trả `{updated, failed: [{id, reason: NOT_FOUND|INVALID_TRANSITION|STALE}]}` — 1 item lỗi không làm hỏng các item khác.
- AC-03 (Authorization): Kiểm tra role thủ công qua `requireRole(callerId, APPLICATION_REVIEW_ROLES)` (route này không có `:id` nên không dùng Guard cấp resource).

**Dependencies:** US-EMPAPP-002.

**Source Traceability:**
```
Backend: employer.service.ts:558-574; employer.repository.ts:762-795
```

---

### EPIC 08 — Interviews

#### [US-INT-001] — Đề xuất lịch phỏng vấn
**Epic:** Interviews | **Actor:** Employer (Owner / Recruiter / Hiring Manager) | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là **nhà tuyển dụng**, tôi muốn **đề xuất tối đa 2 khung giờ phỏng vấn cho ứng viên ở giai đoạn INTERVIEW**, để **sắp lịch phỏng vấn**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `application.status = INTERVIEW`, When `POST /employer/applications/:id/interview` với `{durationMinutes: 15-180, proposedSlots: 1-2 datetime tương lai, meetingUrl?, interviewerId?}`, Then tạo/reset `Interview{status: PENDING}` (upsertPending).
- AC-02 (Validation — điều kiện tiên quyết): Given `application.status ≠ INTERVIEW`, Then 400 `APPLICATION_NOT_AT_INTERVIEW_STAGE`.
- AC-03 (Business rule — đã confirmed): Given interview hiện tại đã `CONFIRMED`, Then 409 `INTERVIEW_ALREADY_CONFIRMED` (không cho sửa khi đã chốt).
- AC-04 (Validation — slot quá khứ): Given slot ≤ hiện tại, Then 400 `INVALID_INTERVIEW_SLOT`.
- AC-05 (Validation — interviewer khác công ty): Given `interviewerId` không phải thành viên cùng công ty, Then 400 `COMPANY_MEMBER_NOT_FOUND`.
- AC-06 (Authorization): `ApplicationOwnershipGuard` — **INTERVIEWER không được đề xuất lịch** (đây là hành động cấp RECRUITER/HIRING_MANAGER trở lên).
- AC-07 (Re-propose sau huỷ): Given interview trước đó `CANCELLED`, When propose lại, Then reset về `PENDING` với slots mới.

**Dependencies:** US-EMPAPP-002 (status phải đạt INTERVIEW trước).

**Source Traceability:**
```
Backend: employer.controller.ts:364-381; interviews.service.ts:135-199; interviews.repository.ts:48-62; interviews/constants.ts:9 (MAX_PROPOSED_SLOTS=2)
Frontend: remotesea-web/src/features/interviews/pages/InterviewPage.tsx (nhánh PENDING: banner "waiting on candidate")
```

---

#### [US-INT-002] — Xác nhận lịch phỏng vấn
**Epic:** Interviews | **Actor:** Talent | **Priority:** P0 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên**, tôi muốn **chọn 1 trong các khung giờ mà nhà tuyển dụng đề xuất**, để **chốt lịch phỏng vấn**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `slot` nằm trong `interview.proposedSlots`, When `PATCH /applications/:id/interview/confirm`, Then `status → CONFIRMED`, `confirmedSlot` set (CAS: chỉ update khi đang `PENDING`), gửi notification `INTERVIEW_CONFIRMED` cho employer.
- AC-02 (Validation): Given `slot` không nằm trong danh sách đề xuất, Then 400 `INVALID_INTERVIEW_SLOT`.
- AC-03 (Race condition): Given đã được confirm bởi request khác (vd double-click), Then 409 (CAS trả null).
- AC-04 (Authorization): `TalentApplicationOwnershipGuard` — chỉ đúng chủ đơn.

**Business Rules:** Chính hành động CONFIRM + `confirmedSlot` đã qua là điều kiện để mở khoá Scorecard (US-SC-001) và Review (US-REV-001).

**Dependencies:** US-INT-001.

**Source Traceability:**
```
Backend: interviews.controller.ts:62-76; interviews.service.ts:201-247; interviews.repository.ts:79-89
Frontend: remotesea-web/src/features/interviews/components/ConfirmInterviewForm.tsx:38-59 (radio chọn 1 trong tối đa 2 slot)
```

---

#### [US-INT-003] — Huỷ lịch phỏng vấn
**Epic:** Interviews | **Actor:** Employer (Owner / Recruiter / Hiring Manager) | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là **nhà tuyển dụng**, tôi muốn **huỷ lịch phỏng vấn đã đề xuất hoặc đã xác nhận**, để **xử lý khi có thay đổi kế hoạch**.

**Acceptance Criteria:**
- AC-01: Given `status ∈ {PENDING, CONFIRMED}`, When `PATCH /employer/applications/:id/interview/cancel`, Then `status → CANCELLED` (CAS), gửi notification `INTERVIEW_CANCELLED` cho talent.
- AC-03 (Authorization): `ApplicationOwnershipGuard` (employer only).
- AC-04 (Không phải terminal tuyệt đối): Sau CANCELLED, employer có thể `propose` lại (US-INT-001) để reset về `PENDING`.

**Dependencies:** US-INT-001.

**Source Traceability:**
```
Backend: interviews.service.ts:254-276
```

---

#### [US-INT-004] — Tải file lịch (.ics) buổi phỏng vấn
**Epic:** Interviews | **Actor:** Talent / Employer (team công ty) | **Priority:** P2 | **Status:** Implemented | **SP:** 1

> Là một **người tham gia phỏng vấn**, tôi muốn **tải file .ics để thêm vào lịch cá nhân**, để **không quên lịch phỏng vấn**.

**Acceptance Criteria:**
- AC-01: Given `interview.status = CONFIRMED` và có `confirmedSlot`, When `GET .../interview/ics`, Then trả file .ics.
- AC-02 (Error handling): Given chưa `CONFIRMED`, Then 400 `INTERVIEW_NOT_CONFIRMED`.

**Dependencies:** US-INT-002.

**Source Traceability:**
```
Backend: interviews.controller.ts (GET .../interview/ics)
```

---

### EPIC 09 — Interview Scorecards

#### [US-SC-001] — Chấm điểm ứng viên sau phỏng vấn
**Epic:** Scorecards | **Actor:** Employer (Owner / Recruiter / Hiring Manager + Interviewer được gán) | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là một **thành viên đội tuyển dụng đã tham gia phỏng vấn**, tôi muốn **ghi nhận đánh giá và khuyến nghị tuyển dụng của mình**, để **đóng góp ý kiến cho quyết định tuyển dụng tập thể**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given phỏng vấn đã hoàn tất (`isInterviewComplete`: `CONFIRMED` + `confirmedSlot` đã qua), When `POST /employer/applications/:id/scorecards` với `{recommendation: STRONG_YES|YES|NO|STRONG_NO, note?}`, Then tạo `InterviewScorecard`.
- AC-02 (Business rule — điều kiện tiên quyết): Given phỏng vấn chưa hoàn tất, Then 403 `SCORECARD_NOT_ELIGIBLE`.
- AC-03 (Business rule — 1 lần/người): Given đã từng chấm điểm đơn này, When chấm lại, Then 409 `SCORECARD_ALREADY_EXISTS` (bắt race P2002, unique `[authorId, applicationId]`). **Không có sửa/xoá** — append-only snapshot.
- AC-04 (Authorization — mở rộng hơn Ownership): `ApplicationAccessGuard` — không chỉ review-tier roles mà cả INTERVIEWER **được gán riêng cho đơn này** cũng chấm được.

**Dependencies:** US-INT-002.

**Source Traceability:**
```
Backend: employer.controller.ts:415-419; scorecards.service.ts:37-72; prisma/schema.prisma (@@unique([authorId, applicationId]))
Frontend: remotesea-web/src/features/scorecards/components/ScorecardSection.tsx (nút chỉ hiện khi !alreadySubmitted && interviewOccurred)
```

---

#### [US-SC-002] — Xem tổng hợp scorecard của 1 đơn
**Epic:** Scorecards | **Actor:** Employer (team công ty + Interviewer được gán) | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là một **thành viên đội tuyển dụng**, tôi muốn **xem tổng hợp các đánh giá scorecard của mọi người đã phỏng vấn ứng viên này**, để **có cái nhìn tổng thể trước khi ra quyết định**.

**Acceptance Criteria:**
- AC-01: When `GET /employer/applications/:id/scorecards`, Then trả `{scorecards, summary: {total, hireCount}}` (`hireCount` = đếm `STRONG_YES + YES`).
- AC-02 (Frontend): Hiển thị breakdown theo 4 mức khuyến nghị + tiến độ "X/eligibleReviewerCount đã nộp" (loại trừ INTERVIEWER chưa được gán khỏi mẫu số).

**Dependencies:** US-SC-001.

**Source Traceability:**
```
Backend: scorecards.service.ts (list, dòng 12-15 HIRE_RECOMMENDATIONS)
Frontend: scorecard.utils.ts (countEligibleReviewers)
```

---

### EPIC 10 — CV Analysis (AI)

> **Lưu ý quan trọng:** Đây là pipeline AI CV **hoàn toàn khác** với `CANDIDATE_ANALYSIS` của `remotesea-ai` (xem Phần 5). Pipeline này gọi thẳng Anthropic/Gemini từ NestJS (`remotesea-api/src/modules/ai/ai.service.ts`), lưu vào model `CvAnalysis` riêng, **là tính năng AI đang chạy thật** trong sản phẩm.

#### [US-CV-001] — Phân tích CV ứng viên bằng AI
**Epic:** CV Analysis (AI) | **Actor:** Employer (Owner / Recruiter / Hiring Manager / Interviewer được gán) | **Priority:** P1 | **Status:** Implemented | **SP:** 5

> Là **nhà tuyển dụng**, tôi muốn **yêu cầu AI phân tích mức độ phù hợp giữa CV ứng viên và tin tuyển dụng**, để **rút ngắn thời gian sàng lọc hồ sơ**.

**Acceptance Criteria:**
- AC-01 (Happy path — lazy trigger): Given ứng viên đã có CV, When `GET /employer/applications/:id/ai-cv-analysis` (bấm nút "Analyze with AI"), Then nếu chưa từng phân tích → gọi AI và lưu (`getOrCreate`); nếu đã có → trả kết quả cache 1:1, KHÔNG tự chạy lại.
- AC-02 (Validation — thiếu CV): Given ứng viên **chưa upload CV** cho đơn này, Then 400 `CV_ANALYSIS_NO_RESUME` (FE bắt riêng lỗi này để hiện "X hasn't uploaded a CV.").
- AC-03 (Error handling — AI chưa cấu hình): Given `AiService.isConfigured = false`, Then 503 `CV_ANALYSIS_UNAVAILABLE`.
- AC-04 (Concurrency): Given nhiều request đồng thời cho cùng 1 `applicationId`, Then dùng `SingleFlight` dedupe — chỉ 1 lệnh gọi AI thật sự chạy.
- AC-05 (Authorization): `ApplicationAccessGuard` (mở cho mọi team member có quyền truy cập đơn, không giới hạn review-tier role).
- AC-06 (Business rule — không ảnh hưởng workflow chính): Kết quả `CvAnalysis.recommendation` (ADVANCE/HOLD/REJECT) **không bao giờ** tự động thay đổi `Application.status` — chỉ là gợi ý tham khảo, **không hiển thị cho ứng viên**.

**Dependencies:** US-APP-001 (ứng viên đã nộp CV).

**Source Traceability:**
```
Backend: employer.controller.ts:491-524; employer.service.ts:724-726; remotesea-api/src/modules/cv-analysis/cv-analysis.service.ts:36-86; prisma/schema.prisma:1092-1118 (CvAnalysis, comment dòng 1086-1091 "Never shown to the talent")
Frontend: remotesea-web/src/features/cv-analysis/components/CvAnalysisCard.tsx (state "chưa request" → nút "Analyze with AI")
```

---

#### [US-CV-002] — Chạy lại phân tích CV
**Epic:** CV Analysis (AI) | **Actor:** (như US-CV-001) | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là **nhà tuyển dụng**, tôi muốn **chạy lại phân tích AI cho 1 ứng viên**, để **cập nhật lại đánh giá nếu CV hoặc yêu cầu công việc đã thay đổi**.

**Acceptance Criteria:**
- AC-01: When `POST /employer/applications/:id/ai-cv-analysis/regenerate`, Then luôn gọi lại AI, **ghi đè** (`replace()`) kết quả cũ — khác với `getOrCreate` (không dùng cache).
- AC-02 (Rate limit): Route được rate-limit theo `cv-analysis:{userId}` — dùng chung 1 bucket với US-CV-001 (không phải 2 giới hạn riêng), cũng như với Tool AI Orchestrator gọi cùng dữ liệu (chặn chat AI trở thành đường vòng miễn phí gọi cùng model tính phí).

**Dependencies:** US-CV-001.

**Source Traceability:**
```
Backend: employer.controller.ts (regenerate route); cv-analysis.service.ts (regenerate)
Frontend: CvAnalysisCard.tsx (icon RefreshCw, disabled khi đang pending)
```

---

### EPIC 11 — Messaging

#### [US-MSG-001] — Nhắn tin theo ngữ cảnh 1 đơn ứng tuyển
**Epic:** Messaging | **Actor:** Talent & Employer (team công ty) | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là **ứng viên hoặc nhà tuyển dụng**, tôi muốn **nhắn tin trực tiếp trong ngữ cảnh 1 đơn ứng tuyển cụ thể**, để **trao đổi thông tin nhanh chóng về vị trí đang ứng tuyển**.

**Acceptance Criteria:**
- AC-01 (Happy path — talent): Given là chủ đơn, When `POST applications/:id/messages` với `body` 1-4000 ký tự, Then tạo `Message`, gửi Notification `MESSAGE_RECEIVED` (chạy nền) cho phía còn lại.
- AC-01b (Happy path — employer): Cùng logic, qua route `employer/applications/:id/messages`, uỷ quyền lại `MessagesService` (dùng chung service, khác controller).
- AC-03 (Authorization): Talent dùng `TalentApplicationOwnershipGuard`; Employer dùng `ApplicationAccessGuard`.
- AC-04 (Validation): `body` rỗng hoặc >4000 ký tự → 400.
- AC-05 (Rate limit): 30 tin/giờ.
- AC-06 (Giới hạn hiển thị — gap ghi nhận): Chỉ trả tối đa **200 tin mới nhất**, KHÔNG có phân trang cho thread dài hơn (comment code tự thừa nhận "no pagination for MVP").

**Business Rules (kiến trúc — quan trọng):**
- Không có model Conversation/Thread riêng — 1 Application = 1 thread ngầm định. **Không có chat tự do** ngoài ngữ cảnh 1 đơn ứng tuyển cụ thể.
- **Không có read/unread tracking** cho tin nhắn (không có field `readAt` trên `Message`).
- **Không có WebSocket/SSE** — polling 8 giây khi đang mở thread (`THREAD_POLL_MS`), xác nhận qua grep toàn bộ 2 repo không có `socket.io`/`ws` dependency nào.

**Dependencies:** US-APP-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/messages/messages.controller.ts:31-62; messages.service.ts:39-73; employer.service.ts:674-683 (ủy quyền); messages/constants.ts
Frontend: remotesea-web/src/features/messages/message.queries.ts:15 (THREAD_POLL_MS=8000); pages/MessageThreadPage.tsx
```

---

### EPIC 12 — Internal Comments

#### [US-COM-001] — Thảo luận nội bộ về 1 ứng viên
**Epic:** Internal Comments | **Actor:** Employer (team công ty) | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **thành viên đội tuyển dụng**, tôi muốn **để lại ghi chú/thảo luận nội bộ trên 1 đơn ứng tuyển**, để **phối hợp đánh giá ứng viên với đồng nghiệp mà không lộ ra ngoài**.

**Acceptance Criteria:**
- AC-01 (Happy path): When `POST /employer/applications/:id/comments` với `body`, Then tạo `ApplicationComment`.
- AC-02 (Đọc): When `GET /employer/applications/:id/comments`, Then trả danh sách sắp theo `createdAt asc` (dạng hội thoại).
- AC-03 (Authorization — mở rộng): `ApplicationAccessGuard` — **mọi thành viên công ty có quyền truy cập đơn này đều đọc/viết được**, không giới hạn theo review-tier role cụ thể.
- AC-04 (Business rule — KHÔNG bao giờ lộ cho ứng viên): **Không tồn tại route nào phía talent** đọc được resource này (đã xác nhận qua grep toàn bộ module chỉ được import bởi `employer.module.ts`). UI ghi rõ: "Only visible to your team, never to the candidate."
- AC-05 (Gap ghi nhận): Không có endpoint sửa/xoá — comment là append-only, giống Message.

**Dependencies:** US-APP-001.

**Source Traceability:**
```
Backend: employer.controller.ts:456-484; comments.service.ts:9-21; prisma/schema.prisma:1072-1084
Frontend: remotesea-web/src/features/comments/components/DiscussionThreadCard.tsx:94-100
```

---

### EPIC 13 — Reviews (đánh giá hai chiều)

#### [US-REV-001] — Kiểm tra điều kiện được phép đánh giá
**Epic:** Reviews | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 1

> Là **ứng viên hoặc nhà tuyển dụng đã từng phỏng vấn nhau**, tôi muốn **biết mình có đủ điều kiện để viết đánh giá hay chưa**, để **quyết định có nên viết đánh giá không**.

**Acceptance Criteria:**
- AC-01: When `GET /reviews/eligibility/:applicationId`, Then trả `{eligible, alreadyReviewed}`.
- AC-02 (Business rule — quy tắc đủ điều kiện, đã verify tận code): `eligible = true` chỉ khi `Interview.status = CONFIRMED` **VÀ** `confirmedSlot` đã trôi qua (`isInterviewComplete`, dùng chung với US-SC-001) — đây là tương tác hai chiều đã xác thực mạnh nhất trong hệ thống, mạnh hơn cả `Application.status` (employer có thể set INTERVIEW/OFFERED mà chưa từng có Interview thật).

**Dependencies:** US-INT-002.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/reviews/reviews.service.ts:61-98; interviews/interview-eligibility.util.ts:16-27
Frontend: remotesea-web/src/features/reviews/components/ReviewCTA.tsx
```

---

#### [US-REV-002] — Viết đánh giá hai chiều sau phỏng vấn
**Epic:** Reviews | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là **ứng viên hoặc nhà tuyển dụng**, tôi muốn **viết đánh giá về đối tác sau khi đã phỏng vấn xong**, để **giúp cộng đồng người dùng khác có thêm thông tin tham khảo**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `eligible=true`, When `POST /reviews`, Then tạo `Review{status: PUBLISHED}` (không có moderation flow — mọi review hiện tại đều PUBLISHED).
- AC-02 (Business rule — direction tự suy ra): `direction` (TALENT_TO_EMPLOYER/EMPLOYER_TO_TALENT) do server tự xác định từ danh tính người gọi, **không** lấy từ request body — dùng chung 1 endpoint cho cả 2 chiều.
- AC-03 (Validation — category theo chiều): Given `direction=TALENT_TO_EMPLOYER` nhưng gửi `reliabilityRating` (field chỉ dành cho chiều ngược lại), Then 400 `REVIEW_INVALID_CATEGORY`.
- AC-04 (Business rule — 1 lần/tác giả/đơn): `@@unique([reviewerId, applicationId])` — check trước (UX) qua `alreadyReviewed` + bắt race condition P2002 → 409 `REVIEW_ALREADY_EXISTS`.
- AC-05 (Business rule — không tự đánh giá): Given cố đánh giá chính mình, Then 400 `REVIEW_SELF_NOT_ALLOWED`.
- AC-06 (Gap ghi nhận): **Không có endpoint sửa** — đã xác nhận qua đọc toàn bộ controller + grep, review là bất biến sau khi tạo (dù model có field `updatedAt` không bao giờ được ghi).

**Dependencies:** US-REV-001.

**Source Traceability:**
```
Backend: reviews.controller.ts:34-85; reviews.service.ts:125-198; prisma/schema.prisma:995-1027
```

---

#### [US-REV-003] — Xem đánh giá công khai của 1 người dùng
**Epic:** Reviews | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **khách truy cập**, tôi muốn **xem các đánh giá công khai về 1 ứng viên hoặc nhà tuyển dụng**, để **có thêm thông tin tham khảo**.

**Acceptance Criteria:**
- AC-01: When `GET /reviews/user/:userId` (**không cần đăng nhập** — "a published review is public profile content"), Then trả danh sách review `PUBLISHED` + số liệu tổng hợp (AVG/COUNT tính ở DB qua `.aggregate()`, không load-all-rồi-tính ở app).

**Dependencies:** US-REV-002.

**Source Traceability:**
```
Backend: reviews.controller.ts:73-75; reviews.repository.ts:37-73
```

---

### EPIC 14 — Notifications

#### [US-NOTIF-001] — Nhận thông báo trong ứng dụng
**Epic:** Notifications | **Actor:** Talent / Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là một **người dùng**, tôi muốn **nhận thông báo trong ứng dụng khi có sự kiện liên quan đến tôi**, để **không bỏ lỡ cập nhật quan trọng**.

**Acceptance Criteria:**
- AC-01: When `GET /notifications`, Then trả danh sách phân trang kèm `unreadCount` bundle trong cùng response.
- AC-02 (Business rule — kênh in-app luôn bật): Thông báo in-app **không bao giờ** bị chặn bởi `NotificationPreference` (chỉ kênh email mới bị gate) — xác nhận qua toàn bộ 10 call site tạo Notification.

**Business Rules — 10 sự kiện tạo Notification (đã liệt kê đủ qua grep toàn repo):**
| # | NotificationType | Trigger | File |
|---|---|---|---|
| 1 | MESSAGE_RECEIVED | Gửi tin nhắn | messages.service.ts:61-67 |
| 2 | INTERVIEW_PROPOSED | Employer đề xuất lịch | interviews.service.ts:187-193 |
| 3 | INTERVIEW_CONFIRMED | Talent xác nhận lịch | interviews.service.ts:235-241 |
| 4 | INTERVIEW_CANCELLED | Employer huỷ lịch | interviews.service.ts:264-270 |
| 5 | JOB_REPORT_RESOLVED | Admin xử lý report | job-reports.service.ts:106-115 |
| 6 | APPLICATION_STATUS_CHANGED | Đổi trạng thái đơn (đơn lẻ) | employer.service.ts:522-528 |
| 7 | APPLICATION_STATUS_CHANGED | Đổi trạng thái đơn (hàng loạt) | employer.service.ts:646-652 |
| 8 | APPLICATION_WITHDRAWN | Talent rút đơn | applications.service.ts:297-303 |
| 9 | OFFER_ACCEPTED / OFFER_DECLINED | Talent phản hồi offer | applications.service.ts:367-378 |
| 10 | INVITATION_RECEIVED | Employer mời ứng tuyển (Job Invitation) | invitations.service.ts:114-120 |

**Dependencies:** Nhiều epic khác (nguồn phát sinh).

**Source Traceability:**
```
Backend: remotesea-api/src/modules/notifications/notifications.service.ts:19-35; prisma/schema.prisma:238-253
```

---

#### [US-NOTIF-002] — Xem số thông báo chưa đọc
**Epic:** Notifications | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 1

> Là một **người dùng**, tôi muốn **thấy số lượng thông báo chưa đọc trên biểu tượng chuông**, để **biết ngay khi có cập nhật mới mà không cần mở danh sách**.

**Acceptance Criteria:**
- AC-01: When `GET /notifications/unread-count`, Then trả `{count}`.
- AC-02 (Polling): FE poll mỗi 30 giây (`UNREAD_COUNT_POLL_MS`), chỉ bật khi component truyền `poll: true` (chuông ở header luôn bật, trang danh sách đầy đủ thì không cần poll thêm).

**Dependencies:** US-NOTIF-001.

**Source Traceability:**
```
Backend: notifications.controller.ts:26-61
Frontend: remotesea-web/src/components/layout/NotificationBell.tsx:29-31; notification.queries.ts:18
```

---

#### [US-NOTIF-003] — Đánh dấu đã đọc thông báo
**Epic:** Notifications | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 1

> Là một **người dùng**, tôi muốn **đánh dấu 1 hoặc tất cả thông báo là đã đọc**, để **giữ danh sách thông báo gọn gàng**.

**Acceptance Criteria:**
- AC-01: When `PATCH /notifications/:id/read`, Then set `readAt` (idempotent — gọi lại không lỗi dù đã đọc rồi).
- AC-02: When `PATCH /notifications/read-all`, Then trả `{updated}` = số lượng vừa đánh dấu.
- AC-03 (Optimistic UI): FE cập nhật UI ngay, rollback nếu lỗi.

**Dependencies:** US-NOTIF-001.

**Source Traceability:**
```
Backend: notifications.service.ts:41-49; notifications.repository.ts:50-54
Frontend: notification.queries.ts:61-194
```

---

### EPIC 15 — Job Alerts

#### [US-ALERT-001] — Tạo cảnh báo việc làm theo tiêu chí
**Epic:** Job Alerts | **Actor:** Talent | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là một **ứng viên**, tôi muốn **thiết lập cảnh báo theo từ khoá/loại hình/cấp bậc/ngành nghề/mức lương**, để **được thông báo khi có tin phù hợp mới mà không phải tự tìm kiếm liên tục**.

**Acceptance Criteria:**
- AC-01: When `POST /alerts` với `{keywords?, jobType?, level?, salaryMin?, country?, timezone?, categoryIds≤3, frequency}`, Then tạo `JobAlert{isActive: true}`.
- AC-02 (Validation): `categoryIds` tối đa 3, `salaryMin` tối đa 10,000,000.

**Dependencies:** US-TAXO-001.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/alerts/alerts.controller.ts; dto/create-alert.dto.ts
```

---

#### [US-ALERT-002] — Quản lý cảnh báo việc làm
**Epic:** Job Alerts | **Actor:** Talent | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **ứng viên**, tôi muốn **sửa, bật/tắt, hoặc xoá cảnh báo đã tạo**, để **điều chỉnh tiêu chí tìm việc theo thời gian**.

**Acceptance Criteria:**
- AC-01: `PATCH/DELETE /alerts/:id` — chỉ chủ sở hữu (`AlertOwnershipGuard`).
- AC-02 (Optimistic UI): Toggle `isActive` cập nhật UI ngay, rollback nếu lỗi.

**Dependencies:** US-ALERT-001.

**Source Traceability:**
```
Frontend: remotesea-web/src/features/alerts/alerts.queries.ts
```

---

#### [US-ALERT-003] — Gửi email khi có job khớp cảnh báo
**Epic:** Job Alerts | **Actor:** System | **Priority:** P2 | **Status:** Implemented | **SP:** 5

> Là **hệ thống**, tôi muốn **tự động gửi email cho ứng viên khi có tin tuyển dụng mới khớp tiêu chí cảnh báo của họ**, để **giữ chân người dùng quay lại nền tảng**.

**Acceptance Criteria:**
- AC-01 (Happy path): When `GET /alerts/cron/dispatch` được gọi (bởi scheduler ngoài), Then với mỗi alert `isActive`, nếu `now - lastSentAt ≥ FREQUENCY_GAP_MS[frequency]` (IMMEDIATE=0, DAILY=24h, WEEKLY=7 ngày) VÀ preference tương ứng bật (`weeklyDigestEnabled` cho WEEKLY, `instantMatchAlertsEnabled` cho IMMEDIATE/DAILY), Then tìm job `ACTIVE` khớp tiêu chí (keywords/jobType/level/country/salaryMin/category) đăng sau `lastSentAt`, gửi email, cập nhật `lastSentAt` (atomic claim chống double-send).
- AC-02 (Kiến trúc — quan trọng, không phải `@Cron`): Đây **không** phải `@nestjs/schedule @Cron` decorator (dù `ScheduleModule.forRoot()` có import — import chết, không có consumer) — là 1 **HTTP endpoint** bảo vệ bằng `CronSecretGuard`, được gọi bởi hệ thống điều phối bên ngoài repo.
- AC-03 `[NEEDS_VERIFICATION]`: Không tìm thấy cấu hình lịch gọi endpoint này trong 2 repo — tần suất gọi thực tế (mỗi giờ? mỗi ngày?) phụ thuộc hạ tầng deploy, ngoài phạm vi source code.
- AC-04 (Giới hạn batch): Tối đa 500 alert/lần chạy (`MAX_ALERTS_PER_RUN`), ưu tiên alert lâu chưa gửi nhất trước.
- AC-05 (Chỉ email, không notification): Alert **chỉ gửi email**, không tạo `Notification` in-app nào.

**Dependencies:** US-ALERT-001, US-AUTH-015.

**Source Traceability:**
```
Backend: alerts.controller.ts:103-108; alerts.service.ts:47-156; alerts/guards/cron-secret.guard.ts; app.module.ts:4,34 (ScheduleModule import chết)
```

---

### EPIC 16 — Job Invitations (Nhà tuyển dụng mời ứng viên)

> Khác biệt hoàn toàn với "Team Invitations" (EPIC 04) — đây là lời mời 1 ứng viên **ứng tuyển vào 1 job cụ thể**, dùng model `JobInvitation`.

#### [US-JINV-001] — Mời 1 ứng viên cụ thể ứng tuyển vào job
**Epic:** Job Invitations | **Actor:** Employer (Owner / Recruiter) | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là **nhà tuyển dụng**, tôi muốn **chủ động mời 1 ứng viên tiềm năng ứng tuyển vào job đang mở**, để **tiếp cận nhân tài thay vì chỉ chờ ứng viên tự nộp đơn**.

**Acceptance Criteria:**
- AC-01: When `POST /invitations` (hoặc route tương đương) với `{talentId, jobId}`, Then tạo `JobInvitation{status: PENDING}`, gửi Notification `INVITATION_RECEIVED` cho talent.
- AC-04 (Trạng thái): `InvitationStatus`: PENDING/ACCEPTED/DECLINED.

**Dependencies:** US-JOB-001, US-TALENT-009 (tìm ứng viên để mời).

**Source Traceability:**
```
Backend: remotesea-api/src/modules/invitations/invitations.service.ts:29-126; invitations.service.ts:114-120; prisma/schema.prisma:823-849 (JobInvitation), 52-56 (InvitationStatus)
```

---

### EPIC 17 — Billing & Payment

#### [US-BILL-001] — Thanh toán đăng tin qua Stripe Checkout
**Epic:** Billing | **Actor:** Employer (Owner) | **Priority:** P0 | **Status:** Implemented | **SP:** 5

*(Xem chi tiết đầy đủ tại US-JOB-003 — cùng 1 tính năng, 2 góc nhìn Epic khác nhau theo yêu cầu không gộp Epic Job và Epic Billing.)*

**Business Rules bổ sung riêng cho Billing:**
- Giá: STANDARD $150 (15000 cents) / FEATURED $350 (35000 cents) / HANDS_ON $1200 (120000 cents) — `common/constants/plan.constants.ts`, khớp chính xác với frontend `constants/plans.ts` (comment FE tự ghi rõ lý do phải khớp: "backend là nơi thực sự tính tiền qua Stripe").
- **Gap xác nhận:** Không có billing history / danh sách thanh toán quá khứ cho employer xem lại (đã grep, 0 kết quả).
- **Gap xác nhận:** Không có refund/cancellation nào được implement (không có `stripe.refunds.*`, không xử lý webhook `charge.refunded`).

**Source Traceability:**
```
Backend: remotesea-api/src/modules/billing/billing.controller.ts:36-51; billing.service.ts:55-114
Frontend: remotesea-web/src/features/post-job/components/StepPlan.tsx (3 gói); pages/PostJobSuccessPage.tsx (message chung chung có chủ đích vì webhook là nguồn sự thật duy nhất)
```

---

#### [US-BILL-002] — Xử lý xác nhận thanh toán tự động (Webhook)
**Epic:** Billing | **Actor:** System (Stripe webhook) | **Priority:** P0 | **Status:** Implemented | **SP:** 5

> Là **hệ thống**, khi Stripe xác nhận 1 giao dịch thành công, tôi muốn **tự động cập nhật trạng thái job và kích hoạt quy trình duyệt**, để **nhà tuyển dụng không cần thao tác thủ công sau khi trả tiền**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given `event.type = checkout.session.completed`, When `POST /billing/webhook`, Then `Job.planPaid=true, paidAt=now, status: DRAFT→PENDING_REVIEW, isFeatured = (planType≠STANDARD)`.
- AC-02 (Security): Route xác thực chữ ký Stripe qua `stripe.webhooks.constructEvent` với raw body (Express raw middleware chỉ áp dụng riêng path này, đăng ký TRƯỚC global body-parser).
- AC-03 (Idempotency): Given webhook gửi lại (Stripe retry), Then no-op (điều kiện `planPaid=false` trong `updateMany` chặn xử lý lần 2).
- AC-04 (Business rule — chỉ 1 loại event): Chỉ xử lý `checkout.session.completed` — không xử lý `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded` (0 kết quả grep).

**Dependencies:** US-BILL-001.

**Source Traceability:**
```
Backend: billing.controller.ts:53-64; billing.service.ts:116-194; main.ts:94-109
```

---

### EPIC 18 — Salary Insights

#### [US-SAL-001] — Xem số liệu tham khảo mức lương
**Epic:** Salary Insights | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **người tìm việc**, tôi muốn **xem mức lương tham khảo theo ngành/cấp bậc/quốc gia**, để **có cơ sở đàm phán lương**.

**Acceptance Criteria:**
- AC-01: When `GET /salary/benchmarks` (+ `/by-seniority`, `/by-country`), Then trả `{role|level|country, min, max, mid, count}`, cache 5 phút.
- AC-02 (Business rule — nguồn dữ liệu thật): Số liệu tính **hoàn toàn từ Job đang `ACTIVE` có `salaryMin`** (raw SQL AVG theo Category/level/`EmployerProfile.hqCountry`) — **KHÔNG phải khảo sát người dùng tự nhập**.
- AC-03 (Gap xác nhận): Nút "Submit your salary, anonymously" trên UI là **placeholder bị disable** (`title="Coming soon"`) — không có backend/DTO/bảng nào cho việc người dùng tự nộp số liệu lương. Không nên coi đây là tính năng đã có.

**Dependencies:** US-JOB-004.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/salary/salary.controller.ts; salary.repository.ts (raw SQL $queryRaw)
Frontend: remotesea-web/src/pages/SalaryPage.tsx; components/salary/SubmitSection.tsx:47-54 (disabled)
```

---

### EPIC 19 — Admin: Employer Verification & Suspension

#### [US-ADM-EMP-001] — Xác minh thủ công 1 nhà tuyển dụng
**Epic:** Admin | **Actor:** Admin | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là **quản trị viên**, tôi muốn **xác minh thủ công 1 nhà tuyển dụng**, để **cấp huy hiệu Verified cho các công ty đáng tin cậy dù họ chưa/không tự xác minh qua email domain**.

**Acceptance Criteria:**
- AC-01: When `PATCH /admin/employers/:id` với `{action: "verify"}`, Then `isVerified=true`, `verifiedAt=now`, **và xoá `suspendedAt`** (verify cũng là hành động un-suspend duy nhất), ghi `AdminAuditLog{action: EMPLOYER_VERIFIED}`.
- AC-03 (Authorization): `RolesGuard + @Roles("ADMIN")` toàn bộ `AdminController`.
- AC-04 (Gap ghi nhận — 2 nguồn sự thật): Action "verify" của admin **không cập nhật** field `verificationStatus` (chỉ dùng cho luồng email tự động ở US-EMP-003) → `isVerified=true` nhưng `verificationStatus` có thể vẫn là `NOT_SUBMITTED` — 2 cơ chế xác minh không đồng bộ với nhau.
- AC-05 (Gap ghi nhận): Admin "verify" **không yêu cầu bằng chứng/tài liệu** nào — chỉ là 1 click chủ quan, không có trường lưu lý do.
- AC-06 (UX gap): Nút "Verify" trên UI **không có confirm modal** (khác với "Suspend" có confirm).

**Dependencies:** US-EMP-001.

**Source Traceability:**
```
Backend: admin.controller.ts:78-86; admin.service.ts:81-113; employer.repository.ts:228-244
Frontend: remotesea-web/src/features/admin/components/AdminEmployers.tsx:117-124
```

---

#### [US-ADM-EMP-002] — Đình chỉ 1 nhà tuyển dụng
**Epic:** Admin | **Actor:** Admin | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là **quản trị viên**, tôi muốn **đình chỉ 1 nhà tuyển dụng vi phạm**, để **ngăn họ tiếp tục hoạt động trên nền tảng và gỡ các tin đang hiển thị**.

**Acceptance Criteria:**
- AC-01 (Happy path, transaction xác nhận có thật): When `PATCH /admin/employers/:id` với `{action: "suspend"}`, Then trong 1 `$transaction`: `isVerified=false, suspendedAt=now` **VÀ** đóng toàn bộ Job đang `ACTIVE` của công ty đó (`status → CLOSED`), ghi `AdminAuditLog{action: EMPLOYER_SUSPENDED}`.
- AC-02 (Business rule — hiệu ứng lan toả): Sau khi suspend, `requireCompanyRole()` chặn **mọi** hành động cấp company-role với message "Your company's account has been suspended" (403 `COMPANY_SUSPENDED`) — check này ưu tiên cao hơn cả kiểm tra role.
- AC-03 (UX — có confirm): Nút "Suspend" có `ConfirmAction` ("Suspend {company}? Their listings will come down immediately.").

**Dependencies:** US-EMP-001, US-JOB-004.

**Source Traceability:**
```
Backend: admin.service.ts:81-113; employer.repository.ts:252-263 (transaction đóng job); company-role.util.ts:60-66
Frontend: AdminEmployers.tsx:100-115
```

---

### EPIC 20 — Admin: Job Moderation

#### [US-ADM-JOB-001] — Xem hàng đợi tin chờ duyệt
**Epic:** Admin | **Actor:** Admin | **Priority:** P0 | **Status:** [PARTIAL] | **SP:** 2

> Là **quản trị viên**, tôi muốn **xem danh sách tin tuyển dụng đang chờ duyệt**, để **xử lý theo thứ tự ưu tiên**.

**Acceptance Criteria:**
- AC-01: When `GET /admin/jobs?status=PENDING_REVIEW` (mặc định), Then trả danh sách sắp theo `paidAt asc` (job trả tiền trước được xét trước).
- AC-05 (Gap ghi nhận — riêng cho Users/Employers, không phải Jobs queue): Ở 2 tab khác (Users, Employers) frontend chỉ fetch **1 trang 50 bản ghi đầu** rồi search/filter hoàn toàn phía client — nếu >50 bản ghi, các bản ghi ngoài trang đầu không bao giờ xuất hiện trong kết quả tìm kiếm dù backend hỗ trợ phân trang đầy đủ. Riêng **Audit Log là tab duy nhất có phân trang thật** trên UI.

**Dependencies:** US-JOB-003.

**Source Traceability:**
```
Backend: admin.repository.ts:123-126; admin/dto/list-jobs.dto.ts
Frontend: remotesea-web/src/features/admin/components/AdminQueue.tsx; admin.queries.ts:31,56,211 (ADMIN_LIST_LIMIT=50)
```

---

#### [US-ADM-JOB-002] — Duyệt / Từ chối tin tuyển dụng
**Epic:** Admin | **Actor:** Admin | **Priority:** P0 | **Status:** [PARTIAL] | **SP:** 5

> Là **quản trị viên**, tôi muốn **duyệt hoặc từ chối 1 tin tuyển dụng đang chờ xét**, để **đảm bảo chất lượng nội dung trên nền tảng**.

**Acceptance Criteria:**
- AC-01 (Happy path — approve): Given `job.status=PENDING_REVIEW`, When `PATCH /admin/jobs/:id` `{action:"approve"}`, Then `status→ACTIVE`, `publishedAt=now`, `expiresAt` tính theo plan, ghi `AdminAuditLog{JOB_APPROVED}`, gửi email "job is live".
- AC-02 (Happy path — reject): `{action:"reject", note?}` → `status→REJECTED`, lưu `reviewNote`, `AdminAuditLog{JOB_REJECTED}`, gửi email "job rejected".
- AC-03 (Validation): Given `job.status ≠ PENDING_REVIEW`, Then 400 `JOB_NOT_PENDING_REVIEW`.
- AC-05 (**GAP xác nhận — mismatch UI/Backend**): Giao diện có 3 nút "Approve & publish / **Request changes** / Reject" nhưng backend chỉ có 2 action (`approve|reject`) — **"Request changes" thực chất gọi cùng API `action="reject"`** như "Reject", chỉ khác nhãn hiển thị; không có trạng thái "cần chỉnh sửa" riêng trong `JobStatus` enum. `[NEEDS_VERIFICATION với PO]`: đây có phải hành vi mong muốn hay cần 1 trạng thái riêng?
- AC-06 (Gap — gate chỉ ở FE): UI khoá nút Approve cho tới khi admin tick đủ 4 mục "Reviewer checklist" và bắt buộc nhập `note` khi reject — nhưng **backend không lưu/không kiểm tra checklist này, `note` là optional ở backend**. Một client khác (Postman, API call trực tiếp) có thể approve/reject mà không qua các gate này.

**Dependencies:** US-JOB-003, US-ADM-JOB-001.

**Source Traceability:**
```
Backend: admin.controller.ts:96-104; admin.service.ts:129-206; jobs.repository.ts:206-254
Frontend: remotesea-web/src/features/admin/components/admin-queue/DecisionBar.tsx:63-91; ReviewerChecklist.tsx; admin.utils.ts:87-104
```

---

#### [US-ADM-JOB-003] — Kiểm tra rủi ro tin bằng AI (advisory)
**Epic:** Admin | **Actor:** Admin | **Priority:** P2 | **Status:** Implemented | **SP:** 3

> Là **quản trị viên**, tôi muốn **xem đánh giá rủi ro của AI (LOW/MEDIUM/HIGH) cho 1 tin đang chờ duyệt**, để **có thêm góc nhìn tham khảo khi ra quyết định**.

**Acceptance Criteria:**
- AC-01 (Happy path, lazy): When `GET /admin/jobs/:id/moderation-flag` (lần đầu bấm), Then AI sinh đánh giá rủi ro + lý do, lưu `JobModerationFlag`.
- AC-02 (Regenerate): `POST .../moderation-flag/regenerate` chạy lại.
- AC-03 (Business rule — CHỈ tham khảo, không gate quyết định): Code tự comment rõ: "Advisory only... `AdminService.reviewJob` never calls this." — **risk flag AI không bao giờ chặn hoặc tự động approve/reject** — admin phải tự đọc và tự quyết định. Cần nêu rõ trong tài liệu để tránh hiểu nhầm đây là auto-moderation.
- AC-05 (Rate limit): 20 lần/phút/admin.

**Dependencies:** US-ADM-JOB-001.

**Source Traceability:**
```
Backend: admin.controller.ts:106-135; remotesea-api/src/modules/job-moderation/job-moderation.service.ts:40-84
Frontend: remotesea-web/src/features/admin/components/admin-queue/AiRiskFlag.tsx
```

---

### EPIC 21 — Admin: Job Reports

#### [US-ADM-REP-001] — Báo cáo 1 tin tuyển dụng vi phạm
**Epic:** Admin | **Actor:** Talent / Employer (đã đăng nhập) | **Priority:** P1 | **Status:** Implemented | **SP:** 2

> Là một **người dùng**, tôi muốn **báo cáo 1 tin tuyển dụng có dấu hiệu vi phạm (lừa đảo, sai sự thật...)**, để **giúp nền tảng loại bỏ nội dung xấu**.

**Acceptance Criteria:**
- AC-01: When `POST /jobs/:id/report` với `reason ∈ {SCAM, MISLEADING, ALREADY_FILLED, DISCRIMINATORY, DUPLICATE, OTHER}`, Then tạo `JobReport{status: OPEN}`.
- AC-03 (Authorization): Bất kỳ user đã đăng nhập nào (không giới hạn role — code tự comment "any authenticated TALENT or EMPLOYER can flag a listing").
- AC-04 (Business rule — trùng lặp): Chỉ chặn nếu đang có report **OPEN** của cùng (job, reporter) → 409 `JOB_ALREADY_REPORTED`. **Gap ghi nhận**: 1 user **có thể báo cáo lại** cùng job sau khi report trước đó đã RESOLVED/DISMISSED (không có unique constraint DB, không có cooldown vĩnh viễn).
- AC-05 (Rate limit): 10 lần/giờ/user.

**Dependencies:** US-JOB-004.

**Source Traceability:**
```
Backend: remotesea-api/src/modules/job-reports/job-reports.controller.ts:35-51; job-reports.service.ts:28-53; job-reports.repository.ts:21-32 (comment: "a plain read-check, not a DB constraint")
```

---

#### [US-ADM-REP-002] — Xử lý báo cáo vi phạm
**Epic:** Admin | **Actor:** Admin | **Priority:** P1 | **Status:** [PARTIAL] | **SP:** 3

> Là **quản trị viên**, tôi muốn **xử lý (resolve/dismiss) các báo cáo vi phạm**, để **dọn dẹp hàng đợi và phản hồi người báo cáo**.

**Acceptance Criteria:**
- AC-01: When `PATCH /admin/reports/:id` `{action: "resolve"|"dismiss"}`, Then `status` đổi tương ứng (CAS chỉ từ OPEN), gửi Notification `JOB_REPORT_RESOLVED` cho reporter (dùng chung 1 type cho cả 2 nhánh, chỉ khác text), ghi `AdminAuditLog`.
- AC-02 (Validation): Given report không còn `OPEN`, Then 400 `JOB_REPORT_ALREADY_RESOLVED`.
- AC-04 (**GAP nghiêm trọng, cần PO xác nhận**): Cả "Resolve" lẫn "Dismiss" **KHÔNG có bất kỳ tác động nào lên chính `Job` bị báo cáo** — không tự động đóng/gỡ/đổi status Job. Nếu admin thực sự muốn gỡ 1 tin scam, họ phải tự thao tác riêng (vd US-JOB-005/US-ADM-JOB-002) — "Resolve" chỉ đơn thuần đánh dấu "đã xử lý report", không đảm bảo tin đã bị gỡ khỏi hệ thống.
- AC-05 (UX — không nhất quán): Nút "Resolve" không có confirm modal; nút "Dismiss" có confirm modal — nên xem lại tính nhất quán.

**Dependencies:** US-ADM-REP-001.

**Source Traceability:**
```
Backend: job-reports.service.ts:67-121; job-reports.repository.ts:82-96
Frontend: remotesea-web/src/features/admin/components/AdminReports.tsx:83-106
```

---

### EPIC 22 — Admin: User Management

#### [US-ADM-USR-001] — Xem/tìm kiếm danh sách người dùng
**Epic:** Admin | **Actor:** Admin | **Priority:** P1 | **Status:** [PARTIAL] | **SP:** 2

> Là **quản trị viên**, tôi muốn **xem và tìm kiếm toàn bộ người dùng trên hệ thống**, để **quản lý tài khoản khi cần**.

**Acceptance Criteria:**
- AC-01: When `GET /admin/users?role=&banned=&q=`, Then backend hỗ trợ tìm kiếm case-insensitive theo email/tên VÀ phân trang đầy đủ.
- AC-05 (**Gap xác nhận**): Frontend chỉ fetch **1 trang 50 bản ghi đầu tiên** (`ADMIN_LIST_LIMIT=50`) rồi search/filter hoàn toàn phía client — nếu hệ thống có >50 user, tìm kiếm sẽ **bỏ sót** các user ngoài trang đầu dù backend đã hỗ trợ đầy đủ phân trang + search server-side.

**Dependencies:** US-AUTH-001.

**Definition of Done:** Backend ✅ (đầy đủ) / Frontend ⚠️ Partial (chưa tận dụng phân trang backend) → cần fix để search server-side.

**Source Traceability:**
```
Backend: admin.service.ts:282-296; admin/dto/list-users.dto.ts
Frontend: admin.queries.ts:31,56,211
```

---

#### [US-ADM-USR-002] — Cấm / Bỏ cấm người dùng
**Epic:** Admin | **Actor:** Admin | **Priority:** P1 | **Status:** Implemented | **SP:** 3

> Là **quản trị viên**, tôi muốn **cấm hoặc bỏ cấm 1 người dùng vi phạm**, để **bảo vệ cộng đồng người dùng khác**.

**Acceptance Criteria:**
- AC-01: When `PATCH /admin/users/:id` `{action: "ban"|"unban"}`, Then `bannedAt` set/xoá tương ứng, ghi `AdminAuditLog{USER_BANNED|USER_UNBANNED}`.
- AC-02 (Hiệu ứng): User bị ban vẫn login **được** đúng bước password nhưng bị chặn ngay sau (403 `ACCOUNT_BANNED`, US-AUTH-002 AC-03) — không tự động revoke session đang có `[NEEDS_VERIFICATION]` (chưa xác nhận có revoke session khi ban hay không trong lượt nghiên cứu này).

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: admin.service.ts:360-369
```

---

#### [US-ADM-USR-003] — Đổi vai trò người dùng
**Epic:** Admin | **Actor:** Admin | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là **quản trị viên**, tôi muốn **đổi vai trò (TALENT/EMPLOYER/ADMIN) của 1 người dùng**, để **xử lý các trường hợp đặc biệt (vd cấp quyền admin cho nhân sự mới)**.

**Acceptance Criteria:**
- AC-01: When `PATCH /admin/users/:id` `{action: "change-role", role}`, Then `User.role` đổi, ghi `AdminAuditLog{USER_ROLE_CHANGED}`.

**Dependencies:** US-AUTH-001.

**Source Traceability:**
```
Backend: admin.service.ts (change-role branch)
```

---

### EPIC 23 — Admin: Audit Log

#### [US-ADM-AUD-001] — Xem nhật ký hành động quản trị
**Epic:** Admin | **Actor:** Admin | **Priority:** P2 | **Status:** [PARTIAL] | **SP:** 3

> Là **quản trị viên**, tôi muốn **xem lại lịch sử mọi hành động quản trị đã thực hiện (ai, làm gì, khi nào, trước/sau)**, để **minh bạch và truy vết khi cần điều tra**.

**Acceptance Criteria:**
- AC-01: When `GET /admin/audit-log?targetType=&targetId=`, Then trả danh sách phân trang thật (page/limit), mỗi dòng có thể expand xem `before`→`after` (JSON diff).
- AC-02 (Business rule — snapshot không FK): Lưu `adminId` + `adminEmail` dạng snapshot (không phải foreign key) — để audit sống sót kể cả khi tài khoản admin đó bị đổi tên/xoá sau này.
- AC-03 (Cơ chế ghi — thủ công, không tự động): `AuditLogService.record()` được **từng service nghiệp vụ tự gọi trực tiếp** — KHÔNG có interceptor/AOP tự động bắt mọi mutation của AdminController. Ghi log thất bại **không** làm hỏng hành động chính (tự nuốt lỗi, có chủ đích).
- AC-04 (**Gap nghiêm trọng — điểm mù audit**): Hành động **tự động của hệ thống không bao giờ được ghi** vào audit log — cụ thể: auto-approval job qua Stripe webhook (US-JOB-004) và cron reconcile **không xuất hiện trong Audit Log** vì không có admin actor (`adminId` là trường bắt buộc). Nếu cần audit đầy đủ mọi thay đổi trạng thái Job (kể cả tự động), cần thiết kế bổ sung.
- AC-05: 9 giá trị `AdminAuditAction` đã liệt kê đủ trong US-ADM-EMP-001/002, US-ADM-JOB-002, US-ADM-REP-002, US-ADM-USR-002/003.

**Dependencies:** US-ADM-EMP-001, US-ADM-JOB-002, US-ADM-REP-002, US-ADM-USR-002, US-ADM-USR-003.

**Source Traceability:**
```
Backend: remotesea-api/src/common/services/audit-log.service.ts:41-68; admin.service.ts:270-280; prisma/schema.prisma:925-950
Frontend: remotesea-web/src/features/admin/components/AdminAuditLog.tsx (tab duy nhất có phân trang thật)
```

---

### EPIC 24 — AI Chat (Trợ lý AI)

> Tính năng AI **thật, đang chạy sống động end-to-end** (khác hẳn nhóm CANDIDATE_ANALYSIS/Feedback/Dataset/Model-Registry ở Phần 5 — nhóm đó infra-only, chưa có caller).

#### [US-AI-001] — Đặt câu hỏi cho trợ lý AI có căn cứ dữ liệu thật
**Epic:** AI Chat | **Actor:** Talent / Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 8

> Là một **người dùng (ứng viên hoặc nhà tuyển dụng)**, tôi muốn **hỏi trợ lý AI về chính sách nền tảng hoặc dữ liệu công việc/đơn ứng tuyển của tôi**, để **nhận câu trả lời nhanh, chính xác, có căn cứ thay vì phải tự tìm kiếm**.

**Acceptance Criteria:**
- AC-01 (Happy path — câu hỏi tri thức thuần): Given hỏi 1 câu hỏi chính sách chung (vd "Nhà tuyển dụng có thể dời lịch phỏng vấn đã xác nhận không?"), When `POST ai-orchestrator/ask` (không kèm `applicationId`), Then hệ thống chạy RAG (truy hồi lai Qdrant + full-text PostgreSQL), trả lời có trích `sources`.
- AC-02 (Happy path — câu hỏi về dữ liệu thật của user): Given kèm `applicationId`, When hỏi "Đơn này đang ở trạng thái nào?", Then AI phân loại ý định, gọi Tool tương ứng (`application`/`candidate_analysis`/`interview`) lấy dữ liệu thật từ remotesea-api (qua context token JWT, cùng guard phân quyền RBAC mà request thường phải đi qua), tổng hợp câu trả lời.
- AC-03 (Business rule — bỏ qua RAG khi thuần hội thoại): Given câu hỏi chào hỏi thuần tuý (vd "Xin chào"), Then hệ thống **không** chạy embedding/RAG (đã verify live qua log: 0 lệnh gọi `/api/embed`) — tiết kiệm chi phí.
- AC-04 (Authorization — cách ly theo vai trò/công ty): Given EMPLOYER hỏi về 1 `applicationId` không thuộc công ty mình, Then Tool tương ứng trả lỗi (403/404), lỗi đó bị bắt **riêng từng Tool** — phần còn lại của câu trả lời vẫn tiếp tục từ các nguồn khác thay vì làm hỏng toàn bộ request.
- AC-05 (Grounding — không bịa đặt): Given không tìm được thông tin liên quan (vd hỏi về kết quả tuyển dụng cuối cùng — không có Tool nào lộ dữ liệu `Scorecard.recommendation`), Then trả lời trung thực "không đủ thông tin" thay vì suy diễn.
- AC-06 (Rate limit): Route bị giới hạn theo `RATE_LIMITS.CHAT`, riêng Tool gọi `candidate-analysis` dùng chung 1 bucket rate-limit với US-CV-001/002 (chặn chat trở thành đường vòng gọi AI tính phí không giới hạn).

**Business Rules (kỹ thuật, chi tiết tại `docs/intelligent-rag.md` phía remotesea-ai):** phân loại ý định (intent classification) 1 lệnh LLM riêng quyết định cả nguồn dữ liệu cần lấy lẫn có cần RAG hay không; cổng lọc độ tin cậy truy hồi (confidence gate); nén ngữ cảnh theo giới hạn ký tự; kiểm tra căn cứ ở cấp từng luận điểm (claim-level grounding); đối chiếu RBAC policy knowledge base.

**Dependencies:** US-AUTH-002, US-APP-001 (để có `applicationId` context), US-CV-001 (Tool candidate-analysis dùng chung dữ liệu).

**Source Traceability:**
```
Backend (remotesea-api): remotesea-api/src/modules/ai-orchestrator/ai-orchestrator.service.ts:55-78,152-203 (mintContextToken, proxyToOrchestrator); ai-orchestrator/tools/tools.controller.ts:34-86
Backend (remotesea-ai): remotesea-ai/app/application/orchestrator_service.py:100-104,257-291,530 (_select_tools, _TOOL_CALLS); app/infrastructure/security.py:35-73
Frontend: remotesea-web/src/features/ai-chat/components/AiChatWidget.tsx:43-111 (AnswerBubble hiện "Sources: ...")
```

---

#### [US-AI-002] — Trò chuyện nhiều lượt với trợ lý AI
**Epic:** AI Chat | **Actor:** Talent / Employer | **Priority:** P1 | **Status:** Implemented | **SP:** 5

> Là một **người dùng**, tôi muốn **tiếp tục hội thoại nhiều lượt với trợ lý AI (AI nhớ ngữ cảnh câu hỏi trước)**, để **không phải lặp lại thông tin đã cung cấp**.

**Acceptance Criteria:**
- AC-01 (Happy path): Given đã có `conversationId`, When gửi câu hỏi tiếp theo không nhắc lại chủ đề cũ, Then AI vẫn trả lời đúng nhờ 6 lượt hội thoại gần nhất được đưa vào prompt (`CONVERSATION HISTORY`).
- AC-02 (Business rule — nhớ cả phiên khác): AI còn tìm kiếm theo độ tương đồng vector (`nomic-embed-text` + pgvector) trong **các cuộc hội thoại KHÁC của cùng user** (`RELATED PAST CONVERSATIONS`, tách biệt khỏi lịch sử phiên hiện tại) — đã verify: 1 thông tin nói ở hội thoại A được nhớ đúng khi hỏi lại từ 1 hội thoại B hoàn toàn mới.
- AC-03 (Authorization — cách ly theo user): Given cố đọc/tiếp tục `conversationId` của **người khác**, Then 404 (kiểm tra theo `user_id` trong JWT, không tin field client gửi lên).
- AC-04 (UX — không streaming): Response trả về **1 lần trọn vẹn**, không có streaming từng token — trong lúc chờ, UI hiện hiệu ứng "đang gõ" (3 chấm động), timeout client 240 giây.
- AC-05 (Validation): Ô nhập giới hạn 2000 ký tự, có cảnh báo khi gần đạt giới hạn.

**Dependencies:** US-AI-001.

**Source Traceability:**
```
Backend (remotesea-ai): remotesea-ai/app/application/chat_service.py (_recent_history, _find_related_turns dòng 100-123; send_message dòng 125-202; _get_owned_conversation)
Backend (remotesea-api): ai-orchestrator.controller.ts (POST/GET chat, JwtAuthGuard, rate-limit riêng từng route)
Frontend: AiChatWidget.tsx:546-573 (composer, DRAFT_MAX_LENGTH=2000); ai-chat.repository.ts:14,38-47 (axios post, timeout 240s, xác nhận KHÔNG dùng SSE/websocket)
```

---

#### [US-AI-003] — Xem lại các cuộc hội thoại AI trước đó
**Epic:** AI Chat | **Actor:** Talent / Employer | **Priority:** P2 | **Status:** Implemented | **SP:** 2

> Là một **người dùng**, tôi muốn **xem lại danh sách và nội dung các cuộc hội thoại AI đã có trước đây**, để **tra cứu lại thông tin đã hỏi**.

**Acceptance Criteria:**
- AC-01: When mở icon "History" trong widget chat, Then hiện dropdown liệt kê mọi hội thoại trước (tiêu đề + thời gian tương đối) qua `GET ai-orchestrator/chat`.
- AC-02: Given chọn 1 hội thoại cũ, When `GET ai-orchestrator/chat/:id`, Then tải toàn bộ các lượt hỏi-đáp của hội thoại đó.
- AC-03: Nút "New chat" bắt đầu hội thoại mới, không mất hội thoại cũ.

**Dependencies:** US-AI-002.

**Source Traceability:**
```
Frontend: AiChatWidget.tsx:253-257,338-397,398-406
```

---

## PHẦN 4 — USER JOURNEY

> Chỉ liệt kê các luồng có bằng chứng source code thật hỗ trợ đầy đủ.

### Journey 1 — Talent: từ đăng ký tới nhận offer
```
Đăng ký (US-AUTH-001, role=TALENT)
 ↓
Đăng nhập (US-AUTH-002) [+ 2FA nếu bật, US-AUTH-003]
 ↓
Tạo hồ sơ: skill, kinh nghiệm, điểm nhấn, CV (US-TALENT-001/004/005)
 ↓
Xác minh email hồ sơ (US-TALENT-002) [tuỳ chọn]
 ↓
Tìm kiếm & lọc tin tuyển dụng (US-JOB-007) → xem điểm phù hợp (US-JOB-010)
 ↓
Xem chi tiết tin (US-JOB-008) → Lưu tin để xem sau (US-JOB-009) [nhánh phụ]
 ↓
Ứng tuyển (US-APP-001)
 ↓
Theo dõi dòng thời gian trạng thái đơn (US-APP-002) [PENDING → REVIEWING → SHORTLISTED]
 ↓
Nhắn tin trao đổi thêm với nhà tuyển dụng (US-MSG-001) [nhánh song song, bất kỳ lúc nào]
 ↓
Trạng thái đơn → INTERVIEW (do employer đổi, US-EMPAPP-002)
 ↓
Nhận đề xuất lịch phỏng vấn (US-INT-001, employer chủ động) → Xác nhận lịch (US-INT-002)
 ↓
Tải file .ics (US-INT-004) [tuỳ chọn]
 ↓
[Phỏng vấn diễn ra ngoài hệ thống]
 ↓
Trạng thái đơn → OFFERED (US-EMPAPP-002)
 ↓
Phản hồi Offer: Accept/Decline (US-APP-004)
 ↓
[Nếu Accept] Viết đánh giá về nhà tuyển dụng (US-REV-001/002, sau khi Interview CONFIRMED + đã qua)
```
**Nhánh phụ song song:** Thiết lập Job Alert (US-ALERT-001) → nhận email khi có tin mới khớp (US-ALERT-003); Rút đơn bất kỳ lúc nào trước OFFERED (US-APP-003); Hỏi trợ lý AI về trạng thái đơn của mình (US-AI-001).

### Journey 2 — Employer: từ tạo công ty tới tuyển được người
```
Đăng ký/Đăng nhập (US-AUTH-001/002)
 ↓
Tạo hồ sơ công ty → trở thành OWNER (US-EMP-001)
 ↓
Xác minh công ty qua email domain (US-EMP-003) [tuỳ chọn, ảnh hưởng auto-approval sau này]
 ↓
Mời thành viên vào team với vai trò RECRUITER/HIRING_MANAGER/INTERVIEWER (US-TEAM-001) → họ chấp nhận (US-TEAM-002)
 ↓
Tạo tin tuyển dụng nháp (US-JOB-001)
 ↓
Thanh toán qua Stripe (US-JOB-003 / US-BILL-001)
 ↓
[Hệ thống] Webhook xác nhận thanh toán (US-BILL-002) → Tự động duyệt nếu đủ điều kiện (US-JOB-004), ngược lại chờ Admin duyệt (US-ADM-JOB-002)
 ↓
Tin ACTIVE, hiển thị công khai (US-JOB-007/008)
 ↓
Nhận đơn ứng tuyển → Xem danh sách ứng viên (US-EMPAPP-001)
 ↓
Phân tích CV bằng AI để sàng lọc nhanh (US-CV-001)
 ↓
Cập nhật trạng thái đơn qua từng vòng: REVIEWING → SHORTLISTED → INTERVIEW (US-EMPAPP-002/003)
 ↓
Đề xuất lịch phỏng vấn (US-INT-001) → Ứng viên xác nhận (US-INT-002)
 ↓
Thảo luận nội bộ về ứng viên với team (US-COM-001) [song song]
 ↓
[Sau phỏng vấn] Chấm scorecard (US-SC-001) → Xem tổng hợp (US-SC-002)
 ↓
Cập nhật trạng thái đơn → OFFERED (US-EMPAPP-002)
 ↓
[Ứng viên Accept] Viết đánh giá về ứng viên (US-REV-002)
 ↓
Đóng tin khi đã tuyển đủ (US-JOB-005)
```
**Nhánh phụ:** Mời trực tiếp 1 ứng viên tiềm năng ứng tuyển (US-JINV-001, tách khỏi luồng chính); Hỏi trợ lý AI về 1 đơn cụ thể (US-AI-001).

### Journey 3 — Admin: xử lý vòng đời kiểm duyệt
```
Đăng nhập với role ADMIN
 ↓
Xem hàng đợi tin chờ duyệt (US-ADM-JOB-001) → [tuỳ chọn] Kiểm tra rủi ro AI (US-ADM-JOB-003)
 ↓
Duyệt hoặc Từ chối (US-ADM-JOB-002)
 ↓
[Song song] Xử lý báo cáo vi phạm từ người dùng (US-ADM-REP-001 → US-ADM-REP-002)
 ↓
[Song song] Xác minh/Đình chỉ nhà tuyển dụng (US-ADM-EMP-001/002)
 ↓
[Song song] Ban/Đổi vai trò người dùng vi phạm (US-ADM-USR-002/003)
 ↓
Xem lại Audit Log để kiểm tra lịch sử hành động (US-ADM-AUD-001)
```

---

## PHẦN 5 — COVERAGE & GAP ANALYSIS

### Bảng Coverage
| Area | Source Found | User Story | Status |
|---|---|---|---|
| Authentication & Account | Yes | US-AUTH-001..020 | Covered |
| Talent Profile | Yes | US-TALENT-001..009 | Covered |
| Employer & Company | Yes | US-EMP-001..005 | Covered |
| Team Management | Yes | US-TEAM-001..006 | Covered |
| Job Management | Yes | US-JOB-001..010 | Covered |
| Taxonomy | Yes | US-TAXO-001..002 | Covered |
| Applications | Yes | US-APP-001..004, US-EMPAPP-001..003 | Covered |
| Interviews | Yes | US-INT-001..004 | Covered |
| Scorecards | Yes | US-SC-001..002 | Covered |
| CV Analysis (AI, live) | Yes | US-CV-001..002 | Covered |
| Messaging | Yes | US-MSG-001 | Covered |
| Internal Comments | Yes | US-COM-001 | Covered |
| Reviews | Yes | US-REV-001..003 | Covered |
| Notifications | Yes | US-NOTIF-001..003 | Covered |
| Job Alerts | Yes | US-ALERT-001..003 | Covered |
| Job Invitations | Yes | US-JINV-001 | Covered |
| Billing | Yes | US-BILL-001..002 | Covered |
| Salary Insights | Yes | US-SAL-001 | Covered |
| Admin: Employer | Yes | US-ADM-EMP-001..002 | Covered |
| Admin: Job Moderation | Yes | US-ADM-JOB-001..003 | Covered |
| Admin: Job Reports | Yes | US-ADM-REP-001..002 | Covered |
| Admin: Users | Yes | US-ADM-USR-001..003 | Covered |
| Admin: Audit Log | Yes | US-ADM-AUD-001 | Covered |
| AI Chat (Orchestrator, live) | Yes | US-AI-001..003 | Covered |
| **AI CANDIDATE_ANALYSIS/Feedback/Dataset/Model-Registry** (remotesea-ai) | Yes (code tồn tại) | **Không có US** | **Infra-only — xem bên dưới** |
| File Uploads (avatar/logo/resume) | Yes | Không tách User Story riêng (là hạ tầng hỗ trợ US-TALENT-001, US-EMP-002, US-APP-001) | Covered (như technical notes) |

### Missing / Partial — theo đúng 6 loại bạn yêu cầu

**A. Có backend nhưng CHƯA có frontend (hoặc frontend không đầy đủ):**
1. **Logo công ty** — backend `employer.service.ts` (updateProfile) validate/lưu `logoUrl` đầy đủ, nhưng **không có form/route nào trong `remotesea-web` cho phép OWNER đổi logo** (US-EMP-002).
2. **Avatar cho tài khoản không có TalentProfile** — `users.service.ts` hỗ trợ `User.image` qua `/uploads/presign` (type avatar), nhưng UI upload avatar **chỉ tồn tại trong form hồ sơ Talent** — user chỉ có tài khoản EMPLOYER (không tạo TalentProfile) không có đường dẫn UI nào để đặt avatar (US-AUTH-014).
3. **Billing history** — Job có sẵn `stripeSessionId`/`paidAt` nhưng không có endpoint/UI liệt kê lịch sử thanh toán (US-BILL-001).
4. **Endpoint logout server-side** — không tồn tại `POST /auth/logout`; nếu backlog cần "đăng xuất chấm dứt session ở server" thì đây là backend còn thiếu, không phải frontend (US-AUTH-009).

**B. Có frontend nhưng CHƯA có backend tương ứng (UI hứa hẹn nhiều hơn thực tế):**
1. **"Invited only" visibility option** (Talent) — UI có option này nhưng không gọi API nào, silent no-op (US-TALENT-003).
2. **2 toggle "Show salary expectation" / "Hide from current employer"** (Talent Visibility) — state cục bộ giả, không persist (US-TALENT-003).
3. **Toggle "Let search engines index my public profile"** (Settings > Privacy) — disabled, comment tự ghi "Not built yet".
4. **"Submit your salary, anonymously"** — nút disabled, không có backend/DTO/bảng nào (US-SAL-001).
5. **isRecruiterPreview trên trang hồ sơ Talent công khai** (`?preview=recruiter`) — toàn bộ match score/nút hành động là dữ liệu mock cứng (US-TALENT-008).
6. **Nút "Request changes" trong Admin Queue** — không có action riêng ở backend, thực chất gọi cùng API với "Reject" (US-ADM-JOB-002).
7. **Reviewer checklist + note bắt buộc khi reject** (Admin Queue) — chỉ là gate phía UI, backend không enforce (US-ADM-JOB-002).

**C. Có database model nhưng KHÔNG có workflow người dùng nào (theo đúng quy tắc #17, không tự tạo Story chỉ vì có model):**
- Không phát hiện model "mồ côi" nào trong 8 lượt nghiên cứu — mọi Prisma model đã khảo sát đều gắn với ít nhất 1 workflow thật.

**D. Có API nhưng KHÔNG có UI (theo đúng quy tắc #18, không tự tạo Story chỉ vì có API) — đây là nhóm lớn nhất và quan trọng nhất cần lưu ý:**

> **`remotesea-ai` — CANDIDATE_ANALYSIS, Feedback Loop, Dataset Builder, Model Registry: `[DOCUMENTED_ONLY]` theo nghĩa "có API thật, có thể gọi qua curl, có test, nhưng KHÔNG có bất kỳ caller nào từ `remotesea-api` hay `remotesea-web`."** Đã xác nhận qua grep toàn bộ 2 repo — **0 kết quả** cho `v1/inference`, `v1/feedback`, `interactionId`, `AiFeedback`.
> - `POST /v1/inference` (task=CANDIDATE_ANALYSIS): phân tích ứng viên bằng mô hình Qwen2.5-3B-Instruct/Ollama, có RAG + historical-case grounding — **hoạt động độc lập, chưa từng được remotesea-api gọi tới**. README của remotesea-ai tự thừa nhận "not wired up on the remotesea-api side yet" — xác nhận vẫn đúng ở code hiện tại dù đã có nhiều commit sau đó.
> - `POST /v1/feedback` (Accept/Edit/Reject): **không có UI Accept/Edit/Reject nào** trong remotesea-web — `CvAnalysisCard.tsx` (UI CV analysis duy nhất) chỉ có nút "Regenerate", không có khái niệm `interactionId`.
> - `POST /v1/datasets/build`, Model Registry (`/v1/models/*`): xác nhận là công cụ nội bộ/admin (chỉ bảo vệ bằng shared secret, không có khái niệm user/role) — **không nên có UI**, đây là hạ tầng chờ pipeline huấn luyện Colab, đúng như thiết kế, không phải thiếu sót.
> - **Không tạo User Story nào cho nhóm này** theo đúng nguyên tắc #17/#18 — API tồn tại không đồng nghĩa với 1 workflow người dùng thật. Đây là phần "Deliberately not built yet" của README, chính xác.
> - **Lưu ý quan trọng khi đọc code liên quan:** `remotesea-api/src/modules/cv-analysis/` (US-CV-001/002) là **một pipeline hoàn toàn khác**, tự gọi thẳng Anthropic/Gemini, không đi qua remotesea-ai — 2 tính năng trùng tên "AI CV analysis" nhưng khác nhau 100% (khác enum recommendation, khác DB, khác auth model). Backlog này chỉ tạo User Story cho pipeline **đang chạy thật** (CV Analysis của remotesea-api).

**E. Có documentation nhưng CHƯA có implementation:**
- Không phát hiện thêm ngoài các mục đã liệt kê ở nhóm B.

**F. Feature đang PARTIAL (đã có nhưng chưa hoàn chỉnh):**
| Story | Vì sao Partial |
|---|---|
| US-AUTH-009 | Không có server-side logout thật |
| US-AUTH-014 | Thiếu UI avatar cho tài khoản không có Talent profile |
| US-AUTH-015 | 3/7 field preference không có nơi đọc để gửi email/push thật |
| US-TALENT-003 | 1 option UI chết + 2 toggle giả |
| US-EMP-002 | Không có UI đổi logo dù backend đầy đủ |
| US-ADM-JOB-001/002 | UI/backend lệch nhau (pagination, "Request changes", checklist chỉ ở FE) |
| US-ADM-REP-002 | Resolve/Dismiss không có tác động thật lên Job |
| US-ADM-USR-001 | Search chỉ hoạt động trong 50 bản ghi đầu |
| US-ADM-AUD-001 | Không ghi nhận hành động tự động của hệ thống |

### Rủi ro nghiệp vụ cần PO quyết định (`[NEEDS_VERIFICATION]` với người có thẩm quyền)
1. **EmployerProfile.userId (creator) không bao giờ đổi** kể cả sau khi chuyển giao OWNER → có thể chặn xoá tài khoản của người đã rời công ty từ lâu (US-AUTH-020, US-TEAM-005).
2. **2 nguồn sự thật cho trạng thái xác minh Employer** (`isVerified` do admin toggle thủ công vs `verificationStatus` do luồng email tự động) không đồng bộ (US-ADM-EMP-001, US-EMP-003).
3. **"Request changes" = "Reject"** trong Admin Queue — cùng 1 action backend, khác nhãn UI (US-ADM-JOB-002).
4. **Resolve Job Report không tự động gỡ Job** — admin có thể "resolve" 1 report scam mà tin vẫn hiển thị công khai (US-ADM-REP-002).
5. **Reset password không revoke session hiện có** trong khi change-password/disable-2FA đều revoke toàn bộ (US-AUTH-007) — có phải cố ý?
6. **Bug xác nhận (không phải suy đoán):** Email "Your job is live" dùng `job.slug` để dựng link nhưng route detail chỉ nhận `id` → **link trong email luôn 404** (US-JOB-008). Đây là bug có thể fix ngay, độ ưu tiên cao vì ảnh hưởng trực tiếp trải nghiệm mọi nhà tuyển dụng sau khi tin được duyệt.

---

## RemoteSEA User Story Coverage Report

- **Phạm vi đã mô hình hoá:** 24 Epic, 93 User Story, bao phủ toàn bộ 30 module backend (`remotesea-api/src/modules/*`) và 26 feature frontend (`remotesea-web/src/features/*`) đã liệt kê ở đầu phiên nghiên cứu, cộng tầng AI Orchestrator/Chat của `remotesea-ai`.
- **Độ tin cậy:** Mọi User Story đều có ít nhất 1 trích dẫn `file:line` từ 8 lượt nghiên cứu song song đọc trực tiếp source code (không dựa vào README/tài liệu mô tả). Các đoạn dựa vào comment trong code (vốn rất chi tiết trong Prisma schema của dự án này) đều được đối chiếu chéo với logic thực thi thật trong service/repository.
- **Phần cố ý KHÔNG mô hình hoá thành User Story:** Toàn bộ API `CANDIDATE_ANALYSIS`/Feedback-loop/Dataset-Builder/Model-Registry của `remotesea-ai` — theo đúng quy tắc "không tạo Story chỉ vì có API", vì xác nhận **0 caller thật** từ 2 service còn lại.
- **9 gap/bug cụ thể đã xác nhận bằng code** (không phải suy đoán) được liệt kê ở Phần 5, trong đó có 1 **bug thật sự cần fix ngay** (link email job-live 404) và nhiều **mismatch UI/Backend** (Request changes, Reviewer checklist, search 50-record limit) cần PO/tech lead quyết định hướng xử lý.
- **Còn lại `[NEEDS_VERIFICATION]` với PO:** cơ chế chuyển giao quyền sở hữu công ty, đồng bộ 2 nguồn xác minh Employer, và ý nghĩa thực sự của hành động "Resolve" trên Job Report.









