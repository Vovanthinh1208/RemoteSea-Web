# Design System — RemoteSEA Web

Mọi giá trị dưới đây được lấy **trực tiếp từ source**, không ước lượng từ ảnh. Nguồn chính:

| Nguồn                                                    | Vai trò                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`tailwind.config.ts`](../../tailwind.config.ts)         | Bảng màu, font family, border radius, shadow, animation                                                                                                                                                                                                 |
| [`src/styles/globals.css`](../../src/styles/globals.css) | CSS variables `:root`, nền/chữ của `body`, thang cỡ chữ "de facto", utility riêng                                                                                                                                                                       |
| [`src/main.tsx`](../../src/main.tsx)                     | Các font được tải thật (`@fontsource/*`)                                                                                                                                                                                                                |
| [`src/components/ui/`](../../src/components/ui/)         | Primitive: `button`, `badge`, `card`, `tabs`, `toast`, `dropdown`, `switch`, `skeleton`, `spinner`, `confirm-dialog`, `stat-card`, `sticky-bottom-bar`, `eyebrow`, `tag`, `file-upload`, `form`                                                         |
| [`src/components/shared/`](../../src/components/shared/) | Thành phần dùng chung: `TextField`, `input-styles.ts`, `FieldError`, `EmptyState`, `EmptyRow`, `ConfirmAction`, `PillToggle`, `FilterGroup`, `CheckRow`, `SkillTagEditor`, `StarRating(Input)`, `VerifiedBadge`, `OfflineBanner`, `PresignedFileUpload` |
| [`src/components/domain/`](../../src/components/domain/) | Thành phần nghiệp vụ: `MatchBadge`, `SalaryBadge`, `RoleBadge`, `AvailabilityBadge`, `CompanyLogo`                                                                                                                                                      |
| [`src/components/layout/`](../../src/components/layout/) | `navbar`, `footer`, `NotificationBell`, `LanguageSwitcher`                                                                                                                                                                                              |

Ảnh minh hoạ thành phần thật lấy từ ứng dụng đang chạy: [`design-system/components-overview.png`](design-system/components-overview.png) (xem mục 12).

---

## 1. Màu sắc

### 1.1 Brand (xanh lá) — `theme.extend.colors.brand`

| Token       | Hex       | Dùng ở đâu (ví dụ thực tế)                                                                     |
| ----------- | --------- | ---------------------------------------------------------------------------------------------- |
| `brand-50`  | `#F0F9F4` | Nền badge `verified`/`positive`, hover nút `outline`                                           |
| `brand-100` | `#DCEFDF` | Badge `new`, `success`                                                                         |
| `brand-200` | `#B8DFC0` |                                                                                                |
| `brand-300` | `#93CFA1` | Viền badge `success`, thanh tiến độ                                                            |
| `brand-400` | `#6DBF82` |                                                                                                |
| `brand-500` | `#4EAD6A` | Chấm trạng thái, focus/hover                                                                   |
| `brand-600` | `#2E9B52` | **Màu chính**: nút `primary`, link, viền focus input, `::selection` (= `--brand`)              |
| `brand-700` | `#1F7A3D` | Hover nút primary (= `--brand-hover`), chữ nhấn serif-italic ở tiêu đề                         |
| `brand-900` | `#0D3D1F` | Gradient panel trái trang Login/Register (`.auth-panel-gradient`: 160°, brand-900 → brand-700) |

### 1.2 Neutral (xám ấm) — ghi đè thang `neutral` mặc định của Tailwind

| Token         | Hex       | Vai trò                                                                                     |
| ------------- | --------- | ------------------------------------------------------------------------------------------- |
| `neutral-50`  | `#F8F7F4` | **Nền trang** (`body`, `--bg`), nền navbar (90% + blur)                                     |
| `neutral-100` | `#EFEDE8` | Viền mặc định của mọi phần tử (`* { border-neutral-100 }`), `--bg-inset`, nền tab segmented |
| `neutral-200` | `#DDD9D1` | Viền input, `--border-strong`, card `bordered`                                              |
| `neutral-300` | `#C7C2B9` |                                                                                             |
| `neutral-400` | `#9B9690` | Placeholder, `--fg-subtle`                                                                  |
| `neutral-500` | `#757069` | Chữ phụ (mô tả, breadcrumb)                                                                 |
| `neutral-600` | `#5C5954` | `--fg-muted`, nút `ghost`                                                                   |
| `neutral-700` | `#423F3C` |                                                                                             |
| `neutral-800` | `#2C2A28` |                                                                                             |
| `neutral-900` | `#1A1917` | **Chữ chính** (`body`, `--fg`), tiêu đề                                                     |

### 1.3 Semantic

| Nhóm                               | Token                                 | Hex                                                                   | Vai trò                                                                                                           |
| ---------------------------------- | ------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Amber (lương / nổi bật / cảnh báo) | `amber-50/100/400/600/700`            | `#FFFBEB` `#FEF3C7` `#F59E0B` `#D97706` `#B45309`                     | `--salary-bg` = amber-100, `--salary-fg` = amber-700; badge `featured`, `warning`                                 |
| Danger (lỗi / phá huỷ)             | `danger-50/100/200/400/500/600/700`   | `#FEF2F2` `#FEE2E2` `#FECACA` `#F87171` `#EF4444` `#DC2626` `#B91C1C` | Nút `danger`, `FieldError`, xác nhận xoá. Giá trị trùng thang `red` mặc định của Tailwind (ghi chú trong config). |
| Info                               | `blue-50/100/700` (Tailwind mặc định) | —                                                                     | Badge `info`, `vn`                                                                                                |

### 1.4 CSS variables (`globals.css :root`)

`--bg #f8f7f4` · `--bg-card #ffffff` · `--bg-inset #efede8` · `--border #efede8` · `--border-strong #ddd9d1` · `--fg #1a1917` · `--fg-muted #5c5954` · `--fg-subtle #9b9690` · `--brand #2e9b52` · `--brand-hover #1f7a3d` · `--salary-bg #fef3c7` · `--salary-fg #b45309` · `--radius 0.5rem`

### 1.5 Dark mode

`tailwind.config.ts` khai báo `darkMode: ["class"]`, nhưng **không có utility `dark:` nào trong `src/`** và không có cơ chế bật class `dark`. → Ứng dụng **chỉ có giao diện sáng**. Không nên mô tả dark mode trong báo cáo.

---

## 2. Typography

| Thuộc tính                            | Giá trị                                                                                                                                                                                                                                                                            | Nguồn                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Font sans (mặc định)                  | **Inter** 400 / 500 / 600 / 700 (`@fontsource/inter`) qua `--font-geist` → `font-sans`                                                                                                                                                                                             | `main.tsx`, `globals.css` (tên biến là "geist" nhưng giá trị là Inter)                                              |
| Font serif                            | **Instrument Serif** 400 + 400 italic (`@fontsource/instrument-serif`) → `font-serif`, utility `.font-serif-italic`                                                                                                                                                                | Dùng cho từ nhấn in nghiêng màu `brand-700` trong tiêu đề trang (ví dụ "Account _settings_"), logo chữ trong navbar |
| Font mono                             | `--font-mono: "JetBrains Mono"` → **không được tải** bằng fontsource, thực tế rơi về `ui-monospace`                                                                                                                                                                                | `globals.css`                                                                                                       |
| Cỡ chữ                                | Không dùng thang `fontSize` của Tailwind; dùng giá trị tuỳ ý `text-[Npx]`. Thang "de facto" được ghi trong `globals.css`: 10 · 10.5 · 11 · 11.5 · 12 · 12.5 · 13 · 13.5 · 14 · 14.5 · 15 · 16 · 17 · 18 · 19 · 20 · 22 · 24 · 26 · 28 · 30 · 32 · 36 · 38 · 40 · 44 · 48 · 52 · 64 | `globals.css`                                                                                                       |
| Cỡ dùng nhiều nhất (đếm trong `src/`) | `13px` (175 lần), `12px` (162), `12.5px` (117), `11px` (117), `15px` (58), `13.5px` (58)                                                                                                                                                                                           | `grep` trên `features/ pages/ components/`                                                                          |
| Độ đậm                                | `font-semibold` (309 lần), `font-medium` (298), `font-normal` (26), `font-bold` (6)                                                                                                                                                                                                | như trên                                                                                                            |
| Rendering                             | `-webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility`                                                                                                                                                                                                          | `body`                                                                                                              |

**Phân cấp thực tế quan sát được** (ví dụ `SettingsPage.tsx`): breadcrumb `12px neutral-500` → H1 trang `32px semibold tracking-tight neutral-900` (+ cụm từ serif-italic `brand-700`) → mô tả `15px neutral-500` → nhãn/nội dung form `13–13.5px` → badge `11.5px medium`.

---

## 3. Spacing, container và lưới

| Thuộc tính         | Giá trị                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing            | Thang mặc định của Tailwind (4px/bước). Không tuỳ biến `spacing`.                                                                                                                              |
| Container phổ biến | `max-w-[1240px]` (25 lần — navbar, footer, phần lớn trang), `max-w-[1200px]` (6), `max-w-[1100px]` (Settings), `max-w-[900px]`, `max-w-[820px]`, `max-w-[640px]`, `max-w-md` cho form xác thực |
| Gutter             | `px-6` (24px) ở navbar và hầu hết trang                                                                                                                                                        |
| Navbar             | `sticky top-0 z-50`, cao `h-14` (56px), `bg-neutral-50/90 backdrop-blur-md`, viền dưới `neutral-100`                                                                                           |
| Lưới điển hình     | CSS grid theo breakpoint, ví dụ Settings `grid-cols-1 lg:grid-cols-[180px_1fr]` (menu mục bên trái 180px từ `lg`)                                                                              |

## 4. Breakpoints

Không khai báo `screens` riêng → dùng mặc định Tailwind: `sm 640px` · `md 768px` · `lg 1024px` · `xl 1280px` · `2xl 1536px`. Tần suất trong code: `sm:` 128 lần, `lg:` 55, `md:` 12 → bố cục chủ yếu đổi ở **640px** (giãn khoảng cách, hiện thêm cột) và **1024px** (hiện sidebar/menu mục, lưới nhiều cột). Ảnh mobile được chụp ở 390×844.

## 5. Border radius

Thang tuỳ biến (px): `rounded-4` · `6` · `8` · `10` · `12` · `14` · `16` · `20` · `24` (+ `rounded-full` cho pill/badge/avatar).

| Thành phần                                             | Radius   |
| ------------------------------------------------------ | -------- |
| Button, tab segmented, logo navbar                     | `8px`    |
| Input / select / textarea (`input-styles.ts`)          | `10px`   |
| Toast, nút lớn ở form xác thực                         | `12px`   |
| Card (`cardVariants`)                                  | `16px`   |
| Card lớn trong settings / post-job / employer / talent | `20px`   |
| Badge, tab `pills`                                     | `9999px` |

## 6. Shadow và viền

| Token            | Giá trị                                                       | Dùng cho                                                                 |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `shadow-card`    | `0 2px 4px rgba(26,25,23,.04), 0 6px 16px rgba(26,25,23,.06)` | Card `elevated`, hover card `interactive`, toast                         |
| `shadow-card-lg` | `0 8px 24px rgba(26,25,23,.10)`                               | Dropdown / panel nổi                                                     |
| `shadow-focus`   | `0 0 0 3px rgba(46,155,82,.20)`                               | **Vòng focus thống nhất** cho mọi control (`focus-visible:shadow-focus`) |
| `shadow-chip`    | `0 1px 2px rgba(26,25,23,.05)`                                | Tab/segment đang chọn                                                    |

Viền mặc định toàn cục: `neutral-100`; viền input: `neutral-200` → `brand-600` khi focus.

## 7. Button (`src/components/ui/button.tsx`, CVA)

Lớp chung: `inline-flex gap-2 font-medium text-sm border rounded-8 transition-all 150ms`, focus `shadow-focus`, `active:translate-y-px`, disabled `opacity-60 cursor-not-allowed`; prop `isLoading` hiện `Spinner` và disable nút.

| Variant              | Kiểu                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| `primary` (mặc định) | nền `brand-600`, chữ trắng, hover `brand-700`, highlight inset trắng 15% |
| `outline`            | nền trong suốt, chữ + viền `brand-600`, hover nền `brand-50`             |
| `ghost`              | trong suốt, chữ `neutral-600`, hover nền `neutral-100`                   |
| `soft`               | nền `neutral-100`, viền `neutral-200`, hover nền trắng                   |
| `danger`             | nền `danger-600`, hover `danger-700` — cho hành động phá huỷ             |

| Size            | Chiều cao / padding           |
| --------------- | ----------------------------- |
| `sm`            | `h-8` (32px) · `px-3` · 13px  |
| `md` (mặc định) | `38px` · `px-4`               |
| `lg`            | `h-11` (44px) · `px-5` · 15px |
| `xl`            | `52px` · `px-6` · 16px        |

## 8. Form controls

- `TEXT_INPUT_CLASS` / `SELECT_INPUT_CLASS` / `TEXTAREA_INPUT_CLASS` (`components/shared/input-styles.ts`): `rounded-10 border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px]`, placeholder `neutral-400`, focus `border-brand-600 + shadow-focus`. Một nguồn duy nhất cho post-job wizard, profile form, settings.
- `TextField`, `FieldError` (chữ đỏ dưới field), `form.tsx`.
- Validation: **react-hook-form + zod** (`zodResolver`) ở các form đăng nhập, đăng ký, quên/đặt lại mật khẩu, đổi mật khẩu, kinh nghiệm làm việc, cảnh báo việc làm, mời thành viên… Thông điệp lỗi lấy từ `i18n/locales/*/validation.json`.
- Control khác: `switch` / `ToggleRow` (bật/tắt thông báo, hiển thị hồ sơ), `PillToggle`, `CheckRow`, `FilterGroup` (sidebar lọc việc làm), `SkillTagEditor` (gợi ý kỹ năng chuẩn — PB52), `StarRatingInput` (đánh giá — PB71), `file-upload` / `PresignedFileUpload` (tải CV, logo qua URL ký sẵn).

## 9. Card, bảng, danh sách

- `Card` (`cardVariants`): `rounded-16 border bg-white`; variant `default` · `bordered` · `elevated` (shadow-card) · `interactive` (hover viền + shadow, con trỏ) · `muted` (`bg-neutral-50/60`); padding `none` · `sm p-4` · `md p-5` · `lg p-6 sm:p-8`.
- `stat-card` cho KPI (dashboard ứng viên, nhà tuyển dụng, admin).
- Danh sách dạng hàng (`ApplicantRow`, `NotificationRow`, `AlertListItem`, `JobCard`) thay vì `<table>`; trạng thái rỗng dùng `EmptyState` / `EmptyRow`; trạng thái tải dùng `skeleton` (`animate-pulse`) theo từng khu vực (`*Skeleton.tsx`).

## 10. Navigation, tabs, dropdown, overlay

- **Navbar** (`navbar.tsx`): logo, link chính `Jobs · Salary · Community · Blog`; khu vực phải thay đổi theo vai trò (khách: _Đăng nhập_, _Đăng ký_, link _For employers_; đã đăng nhập: _Saved_, _Dashboard_ theo vai trò, _Admin_ cho ADMIN, chuông `NotificationBell`, _Settings_), `LanguageSwitcher` (EN/VI). Dưới `lg` thu gọn thành nút menu (`aria-expanded`).
- **Tabs** (`tabs.tsx`): variant `segmented` (mặc định, nền `neutral-100`, tab chọn nền trắng + `shadow-chip`), `pills` (cuộn ngang), `line` (gạch dưới). Một số tab đồng bộ với URL (`useSearchParamState`): `?tab=` ở Admin, `?appTab=` ở dashboard ứng viên, `?applicantTab=` / `?applicantSort=` ở dashboard nhà tuyển dụng.
- **Dropdown** (`dropdown.tsx`), **ConfirmDialog** / **ConfirmAction** (bước xác nhận cho hành động phá huỷ), **Toast** (góc dưới phải, rộng 340px, `rounded-12 shadow-card`), **StickyBottomBar** (thanh lưu cố định — Settings, Profile), **OfflineBanner**.
- Không có primitive Modal/Sheet: form ứng tuyển, báo cáo vi phạm, thêm kinh nghiệm… **mở inline** (ghi chú trong `ApplyButton.tsx`).

## 11. Badge, trạng thái, icon

- `Badge` (`badge.tsx`): `rounded-full px-2 py-0.5 text-[11.5px] font-medium`; variant `verified` · `featured` · `vn` · `new` · `muted` (mặc định) · `info` · `warning` · `positive` · `success`.
- Domain badge: `MatchBadge` (điểm phù hợp — PB50), `SalaryBadge` (amber), `RoleBadge` (vai trò thành viên công ty), `AvailabilityBadge`, `VerifiedBadge` / `VerifiedInline` (công ty đã xác minh).
- Icon: **lucide-react** (ví dụ `Briefcase`, `Building`, `Users`, `Flag`, `Wallet`, `History` trên menu Admin).
- Chuyển động: `animate-fade-up` (0.5s), `chat-pop-in/out` cho widget AI; toàn bộ animation/transition bị tắt khi `prefers-reduced-motion: reduce`.

## 12. Ảnh minh hoạ thành phần

[`design-system/components-overview.png`](design-system/components-overview.png) ghép các phần tử **cắt trực tiếp từ ứng dụng đang chạy** (không vẽ lại). Chi tiết từng mảnh nằm trong `design-system/`.

## 13. Khả năng truy cập và đa ngôn ngữ (liên quan UI)

- Link "Skip to content" ẩn cho tới khi focus; sau mỗi lần chuyển trang focus về `<main>` (`RootLayout.tsx`).
- Vòng focus `shadow-focus` thống nhất; `aria-expanded` / `aria-current` trên menu, tab, chuông.
- i18n tự xây (`src/i18n`): `en` và `vi`, 26 namespace JSON mỗi ngôn ngữ. Thứ tự chọn ngôn ngữ: lựa chọn chưa đồng bộ → cài đặt tài khoản → localStorage → ngôn ngữ trình duyệt → `en`. Bộ ảnh này chụp bằng `en-US`; có thể chụp lại bằng `--locale=vi`.
