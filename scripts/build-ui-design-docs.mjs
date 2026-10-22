/**
 * build-ui-design-docs.mjs — turns the capture output into the generated
 * parts of docs/ui-design/ (tables, CSV, gallery). No dependencies.
 *
 * Inputs (all under docs/ui-design/):
 *   capture-results.json        written by scripts/capture-ui-screenshots.ts
 *   data/product-backlog.json   PB01–PB96 extracted from docs/PRODUCT_BACKLOG_OFFICIAL.md
 *   data/pb-ui-review.json      manual per-PB verdict after reviewing screenshots
 *   data/screen-notes.json      hand-written purpose/layout/behaviour per screen
 *
 * Outputs: ui-inventory.csv, sprint-ui-mapping.md, ui-coverage-matrix.md,
 *          screen-catalog.md, screenshots/README.md, gallery/index.html
 * (README.md, design-system.md, route-audit.md, issues-and-gaps.md are
 *  hand-written.)
 *
 * Usage: node scripts/build-ui-design-docs.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "docs/ui-design");
const read = (f) => JSON.parse(readFileSync(path.join(DIR, f), "utf8"));
const write = (f, s) => {
  mkdirSync(path.dirname(path.join(DIR, f)), { recursive: true });
  writeFileSync(path.join(DIR, f), s);
};

const cap = read("capture-results.json");
const backlog = read("data/product-backlog.json");
const review = existsSync(path.join(DIR, "data/pb-ui-review.json"))
  ? read("data/pb-ui-review.json")
  : {};
// Optional extra run (--ai-chat, second dev server with VITE_ENABLE_AI_CHAT=true).
const results = [
  ...cap.results,
  ...(existsSync(path.join(DIR, "capture-results.ai-chat.json"))
    ? read("capture-results.ai-chat.json").results
    : []),
];
const SPRINTS = [1, 2, 3, 4];
const sprintName = {
  1: "Sprint 1 — Nền tảng hệ thống, Xác thực & Danh mục chuẩn",
  2: "Sprint 2 — Hồ sơ ứng viên, Doanh nghiệp & Tin tuyển dụng",
  3: "Sprint 3 — Ứng tuyển, Phỏng vấn, Đánh giá, Tin nhắn & Thanh toán",
  4: "Sprint 4 — Dịch vụ AI, Cảnh báo, Quản trị Admin & Tích hợp",
};
const folder = (s) => (s === "shared" ? "shared" : `sprint-0${s}`);
const esc = (s) =>
  String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
const csv = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const okShots = (r) => r.shots.filter((s) => s.ok);
const img = (file, from) =>
  path.posix.join(from, file.split(path.sep).join("/"));
// A PB's screens: those declaring it, plus any the manual review links to it.
const screensFor = (pb) =>
  results.filter(
    (r) =>
      r.screen.pbs.includes(pb) || review[pb]?.screens?.includes(r.screen.id)
  );
const screenStatus = (r) => {
  if (r.status === "BLOCKED_AUTH") return "BLOCKED_AUTH";
  if (r.status === "FAILED")
    return r.apiErrors.length ? "BLOCKED_API" : "NOT_VERIFIED";
  if (r.status === "UNEXPECTED_REDIRECT") return "NOT_VERIFIED";
  const states = r.shots.filter(
    (s) =>
      !["desktop", "desktop-full", "mobile", "mobile-full"].includes(s.state)
  );
  if (r.status === "PARTIAL") return "PARTIALLY_CAPTURED";
  if (r.apiErrors.some((e) => / -> 5\d\d$/.test(e)))
    return "PARTIALLY_CAPTURED";
  if (r.screen.pbs[0] === "UNMAPPED") return "IMPLEMENTED_BUT_UNMAPPED";
  return states.length && states.every((s) => s.ok)
    ? "CAPTURED_AND_VERIFIED"
    : "CAPTURED_NOT_INTERACTION_TESTED";
};
const pbStatus = (pb) =>
  review[pb]?.status ??
  (screensFor(pb).length ? screenStatus(screensFor(pb)[0]) : "NOT_VERIFIED");

// ------------------------------------------------------------ inventory ----
const invHeader = [
  "screen_id",
  "sprint",
  "pb_ids",
  "actor",
  "feature",
  "screen_name",
  "route",
  "url_captured",
  "final_url",
  "capture_status",
  "ui_status",
  "state",
  "state_label",
  "viewport",
  "full_page",
  "screenshot",
  "bytes",
  "api_errors",
  "captured_at",
];
const invRows = [];
for (const r of results) {
  const shots = r.shots.length
    ? r.shots
    : [
        {
          state: "-",
          label: "-",
          viewport: "-",
          fullPage: false,
          file: "",
          bytes: 0,
        },
      ];
  for (const s of shots)
    invRows.push([
      r.screen.id,
      r.screen.sprint,
      r.screen.pbs.join(" "),
      r.screen.actor,
      r.screen.feature,
      r.screen.title,
      r.screen.route,
      r.url,
      r.finalUrl,
      r.status,
      screenStatus(r),
      s.state,
      s.label,
      s.viewport,
      s.fullPage,
      s.ok === false
        ? ""
        : s.file
          ? `screenshots/${s.file.split(path.sep).join("/")}`
          : "",
      s.bytes,
      r.apiErrors.join("; "),
      cap.generatedAt,
    ]);
}
write(
  "ui-inventory.csv",
  "﻿" +
    [invHeader, ...invRows].map((row) => row.map(csv).join(",")).join("\n") +
    "\n"
);

// -------------------------------------------------------- sprint mapping ---
let map = `# Ánh xạ Sprint → PB → Màn hình → Ảnh chụp\n\n> File sinh tự động bởi \`scripts/build-ui-design-docs.mjs\` từ \`capture-results.json\` (lần chụp ${cap.generatedAt}) và \`data/product-backlog.json\`. Không sửa tay — chạy lại script.\n\nCột *Màn hình* liệt kê mọi màn hình có chứa PB đó (một PB có thể thuộc nhiều màn hình; một màn hình có thể phục vụ nhiều PB). Ảnh đại diện là ảnh desktop đầu tiên của màn hình chính.\n\n`;
for (const sp of SPRINTS) {
  const pbs = Object.values(backlog).filter((p) => p.sprint === sp);
  map += `## ${sprintName[sp]}\n\n| PB | User Story / Tính năng | Actor (theo Backlog) | Route | Màn hình (Screen ID) | Ảnh đại diện | Trạng thái UI |\n|---|---|---|---|---|---|---|\n`;
  for (const p of pbs) {
    const scr = screensFor(p.id);
    const primary = scr.find((r) => okShots(r).length);
    const routes =
      [...new Set(scr.map((r) => `\`${r.screen.route}\``))].join("<br>") || "—";
    const screens = scr.map((r) => `${r.screen.id}`).join("<br>") || "—";
    const shot = primary
      ? `[${path.basename(okShots(primary)[0].file)}](${img(okShots(primary)[0].file, "screenshots")})`
      : "—";
    map += `| ${p.id} | ${esc(p.title)} | ${esc(p.actor)} | ${routes} | ${screens} | ${shot} | \`${pbStatus(p.id)}\` |\n`;
  }
  map += "\n";
}
const unmapped = results.filter((r) => r.screen.pbs.includes("UNMAPPED"));
map += `## Màn hình chưa ánh xạ được vào PB (UNMAPPED)\n\n| Screen ID | Màn hình | Route | Lý do |\n|---|---|---|---|\n`;
for (const r of unmapped)
  map += `| ${r.screen.id} | ${esc(r.screen.title)} | \`${r.screen.route}\` | ${esc(review[`UNMAPPED:${r.screen.id}`]?.note ?? "Không có PB nào trong Product Backlog mô tả màn hình này")} |\n`;
write("sprint-ui-mapping.md", map);

// -------------------------------------------------------- coverage matrix --
let cov = `# Ma trận bao phủ UI theo Acceptance Criteria\n\n> Sinh tự động. Cột *Runtime Test* chỉ nói về việc **mở và tương tác với giao diện** trong lần chụp; không thay thế kiểm thử chức năng (xem \`docs/SPRINT*_TEST_REPORT.md\` ở thư mục gốc dự án). Đã chụp ≠ đã kiểm thử chức năng.\n\nTrạng thái: \`CAPTURED_AND_VERIFIED\` · \`CAPTURED_NOT_INTERACTION_TESTED\` · \`PARTIALLY_CAPTURED\` · \`BLOCKED_AUTH\` · \`BLOCKED_API\` · \`ROUTE_NOT_FOUND\` · \`IMPLEMENTED_BUT_UNMAPPED\` · \`NOT_IMPLEMENTED\` · \`NOT_VERIFIED\`\n\n`;
const tally = {};
for (const sp of SPRINTS) {
  cov += `## ${sprintName[sp]}\n\n| Sprint | PB ID | Acceptance Criteria (tóm tắt) | Actor | Route | Screenshot | Runtime Test | Status |\n|---|---|---|---|---|---|---|---|\n`;
  for (const p of Object.values(backlog).filter((x) => x.sprint === sp)) {
    const scr = screensFor(p.id);
    const st = pbStatus(p.id);
    tally[st] = (tally[st] ?? 0) + 1;
    const shots = scr.flatMap((r) =>
      okShots(r)
        .filter((s) => s.state !== "desktop-full" && s.state !== "mobile-full")
        .slice(0, 3)
    );
    const ac = p.acceptance
      .map((a) => esc(a.length > 140 ? a.slice(0, 137) + "…" : a))
      .join("<br>");
    const runtime =
      review[p.id]?.runtime ??
      (scr.length
        ? scr
            .map(
              (r) =>
                `${r.screen.id}: ${r.status}${r.apiErrors.length ? " (API lỗi: " + r.apiErrors.slice(0, 2).join(", ") + ")" : ""}`
            )
            .join("<br>")
        : "Không có màn hình");
    cov += `| ${sp} | ${p.id} | ${ac} | ${esc(p.actor)} | ${[...new Set(scr.map((r) => `\`${r.screen.route}\``))].join("<br>") || "—"} | ${shots.map((s) => `[${s.state}](${img(s.file, "screenshots")})`).join("<br>") || "—"} | ${esc(runtime)} | \`${st}\`${review[p.id]?.note ? "<br>" + esc(review[p.id].note) : ""} |\n`;
  }
  cov += "\n";
}
cov += `## Tổng hợp trạng thái (96 PB)\n\n| Trạng thái | Số PB |\n|---|---:|\n${Object.entries(
  tally
)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| \`${k}\` | ${v} |`)
  .join("\n")}\n`;
write("ui-coverage-matrix.md", cov);

// --------------------------------------------------------- screen catalog --
const purpose = read("data/screen-notes.json");
let cat = `# Screen Catalog — RemoteSEA Web\n\n> Phần khung (route, PB, trạng thái, ảnh, cấu trúc DOM đo được) sinh tự động từ lần chụp ${cap.generatedAt}. Phần *Mục đích / Bố cục / Hành vi* được viết tay trong \`data/screen-notes.json\` sau khi xem ảnh và đọc source.\n\nMức bằng chứng: **Runtime** = đã mở trên ứng dụng đang chạy · **Source** = chỉ đọc code · **Chưa xác minh**.\n\n`;
for (const sp of [...SPRINTS, "shared"]) {
  const list = results.filter((r) => r.screen.sprint === sp);
  if (!list.length) continue;
  cat += `## ${sp === "shared" ? "Màn hình dùng chung / chưa ánh xạ PB" : sprintName[sp]}\n\n`;
  for (const r of list) {
    const n = purpose[r.screen.id] ?? {};
    const shots = okShots(r);
    cat += `### ${r.screen.id} — ${r.screen.title}\n\n`;
    cat += `| Thuộc tính | Giá trị |\n|---|---|\n| Sprint | ${sp} |\n| PB | ${r.screen.pbs.map((x) => (backlog[x] ? `${x} (${esc(backlog[x].title)})` : x)).join("<br>")} |\n| Actor chụp | ${r.screen.actor} |\n| Route | \`${r.screen.route}\` (đã mở: \`${r.url}\`${r.redirected ? ` → \`${r.finalUrl}\`` : ""}) |\n| Điều kiện truy cập | ${esc(n.access ?? "—")} |\n| Component | ${esc(n.component ?? "—")} |\n| Trạng thái chụp | \`${r.status}\` → UI status \`${screenStatus(r)}\`${r.retried ? " (đã thử lại 1 lần)" : ""} |\n| Mức bằng chứng | ${shots.length ? "Runtime" : "Source"} |\n`;
    if (r.apiErrors.length)
      cat += `| Lỗi API khi chụp | ${esc(r.apiErrors.join(", "))} |\n`;
    if (r.dom)
      cat += `| DOM đo được | ${r.dom.inputs} input · ${r.dom.forms} form · ${r.dom.tables} bảng · ${r.dom.links} link |\n`;
    cat += "\n";
    if (n.purpose) cat += `**Mục đích.** ${n.purpose}\n\n`;
    if (n.navigation) cat += `**Điều hướng.** ${n.navigation}\n\n`;
    if (n.layout) cat += `**Bố cục.** ${n.layout}\n\n`;
    if (n.behavior) cat += `**Hành vi đã quan sát.** ${n.behavior}\n\n`;
    if (n.gaps) cat += `**Hạn chế / chưa xác minh.** ${n.gaps}\n\n`;
    if (r.dom?.headings?.length)
      cat += `<details><summary>Tiêu đề đo được trên trang (${r.dom.headings.length})</summary>\n\n${r.dom.headings.map((h) => `- ${esc(h)}`).join("\n")}\n\n</details>\n\n`;
    if (shots.length) {
      cat += `| Trạng thái UI | Viewport | Ảnh |\n|---|---|---|\n`;
      for (const s of shots)
        cat += `| ${esc(s.label)} | ${s.viewport}${s.fullPage ? " (full page)" : ""} | [${path.basename(s.file)}](${img(s.file, "screenshots")}) |\n`;
      cat += `\n![${esc(r.screen.title)}](${img(shots[0].file, "screenshots")})\n\n`;
    }
    const failed = r.shots.filter((s) => !s.ok);
    if (failed.length)
      cat += `**Không chụp được:** ${failed.map((s) => `${s.state} (${esc(s.error)})`).join("; ")}\n\n`;
  }
}
write("screen-catalog.md", cat);

// ------------------------------------------------------------ route audit --
const routes = read("data/routes.json");
const byId = Object.fromEntries(results.map((r) => [r.screen.id, r]));
let ra = `# Route Audit — RemoteSEA Web

> Bảng route sinh tự động từ \`data/routes.json\` (rà soát tay \`src/router/AppRouter.tsx\`, \`src/features/sprints/sprint-routes.ts\`) + kết quả runtime trong \`capture-results.json\` (${cap.generatedAt}).

## 1. Tổng quan

- Router: React Router 7, toàn bộ route lồng trong \`RootLayout\` (Navbar + \`<main>\` + Footer). Mọi trang được lazy-load.
- **${routes.length - 1} route cụ thể + 1 catch-all \`*\`** (đếm \`path=\` trong \`AppRouter.tsx\`: 36, trong đó \`/\` là route layout chứa \`index\` = HomePage).
- Guard: \`GuestOnlyRoute\` (4 route xác thực), \`ProtectedRoute\` không giới hạn vai trò (5), \`ProtectedRoute roles=[TALENT]\` (3), \`[EMPLOYER]\` (5), \`[ADMIN]\` (1), \`[TALENT, EMPLOYER]\` (2). Còn lại công khai.
- Khách mở route được bảo vệ → \`/login?callbackUrl=…\`; sai vai trò → \`/\` (đã xác minh runtime: S1-AUTH-GUARD, S4-ROLE-GUARD).

## 2. Cấu hình hiển thị theo Sprint (feature flags)

| Biến | Khai báo / đọc ở | Tác dụng | Giá trị local (\`.env\`) khi chụp | Giá trị deploy (\`fly.toml\`) |
|---|---|---|---|---|
| \`VITE_ENABLE_SPRINT_BOARD\` | \`sprint-visibility.ts → isSprintBoardEnabled()\`, \`AppRouter.tsx\` | Có khai báo route \`/sprints\` hay không. Luôn bật khi \`import.meta.env.DEV\`. | \`true\` (và đang chạy dev) | \`"true"\` |
| \`VITE_VISIBLE_SPRINTS\` | \`SprintBoardPage.tsx → selectVisibleSprints()\` | **Chỉ** lọc các Sprint hiển thị *trên Sprint Board*. Không ảnh hưởng route nào khác. Mặc định \`"1"\`. | \`all\` | \`"1"\` |
| \`VITE_SPRINT_FOCUS\` | \`sprint-visibility.ts → getSprintFocus()\`, \`RootLayout.tsx\`, \`resolveVisiblePath()\` | Giới hạn **toàn ứng dụng**: route thuộc Sprint không được chọn hiển thị \`SprintUnavailablePage\` thay cho trang, link/redirect bị đổi về đích Sprint 1. Không đặt / \`all\` = không giới hạn. | \`all\` | không đặt (dòng bị comment) |
| \`VITE_ENABLE_AI_CHAT\` | \`RootLayout.tsx\` (\`AI_CHAT_ENABLED\`) | Có render widget Trợ lý AI (PB94–PB96) hay không. | **không đặt → widget ẩn** | không đặt |

Kết luận:
- Ẩn Sprint trên Sprint Board (\`VITE_VISIBLE_SPRINTS\`) **khác** với chặn route của cả ứng dụng (\`VITE_SPRINT_FOCUS\`). Với cấu hình local hiện tại cả 4 Sprint đều được phép hiển thị → mọi route đều mở được, **không cần sửa \`.env\`**.
- Bản deploy theo \`fly.toml\` chỉ hiện Sprint 1 trên Sprint Board, nhưng không chặn route (FOCUS đang tắt).
- Widget AI bị ẩn bởi \`VITE_ENABLE_AI_CHAT\`; để chụp, đã chạy **một dev server thứ hai** (cổng 3002) với biến này trong *process env*, \`.env\` không bị sửa, server :3001 của người dùng không bị đụng tới (xem \`issues-and-gaps.md\`).
- Bảng gán route → Sprint (\`sprint-routes.ts\`) được dùng nguyên văn cho cột "Sprint (route)" dưới đây.

## 3. Bảng route

Cột *Runtime*: kết quả mở route trong lần chụp — \`OK\`, \`PARTIAL\` (một số ảnh trạng thái lỗi), \`REDIRECT_AS_EXPECTED\`, \`UNEXPECTED_REDIRECT\`, \`FAILED\`, \`BLOCKED_AUTH\`; kèm lỗi API (HTTP ≥ 400) quan sát được.

| # | Route | Component | Guard | Sprint (route) | PB | Điều hướng tới | API chính | Màn hình đã chụp | Runtime |
|---:|---|---|---|---|---|---|---|---|---|
`;
routes.forEach((rt, i) => {
  const scr = rt.screens.map((id) => byId[id]).filter(Boolean);
  const runtime = scr.length
    ? scr
        .map(
          (r) =>
            `${r.screen.id}: \`${r.status}\`${r.apiErrors.length ? ` — ${r.apiErrors.join(", ")}` : ""}`
        )
        .join("<br>")
    : "Không chụp";
  ra += `| ${i + 1} | \`${rt.path}\` | \`${rt.component}\` | ${esc(rt.guard)} | ${rt.routeSprint} | ${rt.pbs.join(", ")} | ${esc(rt.nav)} | ${esc(rt.api)} | ${rt.screens.join("<br>")} | ${esc(runtime)} |\n`;
});
const orphanScreens = results.filter(
  (r) => !routes.some((rt) => rt.screens.includes(r.screen.id))
);
ra += `\n## 4. Đối chiếu số lượng\n\n- Route khai báo: ${routes.length} (gồm \`*\`). Route có ít nhất một màn hình đã chụp thành công: ${routes.filter((rt) => rt.screens.some((id) => byId[id] && okShots(byId[id]).length)).length}.\n- Màn hình không gắn với một route riêng (widget / thao tác trên navbar): ${orphanScreens.map((r) => r.screen.id).join(", ") || "—"}.\n- Route không xuất hiện trên navigation (chỉ vào được qua email, redirect hoặc link trong trang): ${routes
  .filter((rt) => /^(Chỉ|Không có)/.test(rt.nav))
  .map((rt) => `\`${rt.path}\``)
  .join(", ")}.\n`;
write("route-audit.md", ra);

// ------------------------------------------------------ screenshots README -
let sr = `# Danh mục ảnh chụp\n\nLần chụp: ${cap.generatedAt} · Base URL: \`${cap.baseUrl}\` · Locale: \`${cap.locale}\` · Desktop ${cap.viewports.desktop.width}×${cap.viewports.desktop.height}, Mobile ${cap.viewports.mobile.width}×${cap.viewports.mobile.height} (DPR 2)\n\nQuy ước tên: \`PBxx-actor-feature-screen-state.png\` — PB đầu tiên là PB chính của màn hình; danh sách PB đầy đủ nằm trong \`../ui-inventory.csv\`. Ảnh màn hình chưa ánh xạ PB có tiền tố \`UNMAPPED-\` và nằm trong \`shared/\`.\n\n`;
for (const sp of [...SPRINTS, "shared"]) {
  const list = results.filter((r) => r.screen.sprint === sp);
  const shots = list.flatMap((r) => okShots(r).map((s) => ({ r, s })));
  sr += `## ${folder(sp)}/ (${shots.length} ảnh)\n\n| Ảnh | PB | Tính năng / Màn hình | Actor | Trạng thái UI |\n|---|---|---|---|---|\n`;
  for (const { r, s } of shots)
    sr += `| [${path.basename(s.file)}](${s.file.split(path.sep).join("/")}) | ${r.screen.pbs.join(", ")} | ${esc(r.screen.title)} | ${r.screen.actor} | ${esc(s.label)} |\n`;
  sr += "\n";
}
write("screenshots/README.md", sr);

// --------------------------------------------------------------- gallery ---
const items = results.flatMap((r) =>
  okShots(r).map((s) => ({
    src: img(s.file, "../screenshots"),
    file: path.basename(s.file),
    sprint: String(r.screen.sprint),
    pbs: r.screen.pbs,
    actor: r.screen.actor,
    feature: r.screen.feature,
    screenId: r.screen.id,
    title: r.screen.title,
    route: r.screen.route,
    state: s.label,
    viewport: s.viewport,
    full: s.fullPage,
  }))
);
const gallery = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RemoteSEA UI Gallery</title>
<style>
:root{--bg:#f8f7f4;--card:#fff;--fg:#1a1917;--muted:#5c5954;--line:#ddd9d1;--brand:#2e9b52;--brand-50:#f0f9f4}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:16px}
h1{margin:0 0 4px;font-size:20px}header p{margin:0 0 12px;color:var(--muted);font-size:13px}
.controls{display:flex;flex-wrap:wrap;gap:8px}input,select{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;min-width:0}
input{flex:1 1 220px}main{padding:16px;max-width:1440px;margin:0 auto}
h2{font-size:16px;margin:28px 0 10px}h3{font-size:13px;margin:16px 0 8px;color:var(--muted);font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
figure a{display:block;background:#efede8;aspect-ratio:16/10;overflow:hidden}figure img{width:100%;height:100%;object-fit:cover;object-position:top}
figcaption{padding:10px 12px;font-size:12.5px}figcaption b{display:block;font-size:13px}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.tag{background:var(--brand-50);color:#1f7a3d;border-radius:99px;padding:1px 8px;font-size:11px}
.tag.m{background:#efede8;color:var(--muted)}code{font-size:11.5px;color:var(--muted);word-break:break-all}
.count{color:var(--muted);font-size:12px;margin-left:6px}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#1a1917;--card:#2c2a28;--fg:#f8f7f4;--muted:#c7c2b9;--line:#423f3c;--brand-50:#0d3d1f}:root:not([data-theme="light"]) input,:root:not([data-theme="light"]) select{background:#2c2a28;color:var(--fg)}}
</style>
</head>
<body>
<header>
<h1>RemoteSEA — Thư viện ảnh giao diện</h1>
<p>Chụp ${cap.generatedAt} từ <code>${cap.baseUrl}</code> · ${items.length} ảnh · ${results.length} màn hình. Bấm ảnh để mở kích thước gốc.</p>
<div class="controls">
<input id="q" type="search" placeholder="Tìm theo tên màn hình, PB (vd. PB47), route, trạng thái…">
<select id="sprint"><option value="">Mọi Sprint</option>${SPRINTS.map((s) => `<option value="${s}">Sprint ${s}</option>`).join("")}<option value="shared">Dùng chung / UNMAPPED</option></select>
<select id="actor"><option value="">Mọi actor</option><option>guest</option><option>talent</option><option>employer</option><option>admin</option></select>
<select id="vp"><option value="">Mọi viewport</option><option>desktop</option><option>mobile</option></select>
</div>
</header>
<main id="out"></main>
<script>
const ITEMS = ${JSON.stringify(items)};
const NAMES = ${JSON.stringify({ ...sprintName, shared: "Dùng chung / chưa ánh xạ PB" })};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function render() {
  const q = $("q").value.trim().toLowerCase(), sp = $("sprint").value, ac = $("actor").value, vp = $("vp").value;
  const list = ITEMS.filter((i) => (!sp || i.sprint === sp) && (!ac || i.actor === ac) && (!vp || i.viewport === vp) &&
    (!q || [i.title, i.pbs.join(" "), i.route, i.state, i.file, i.screenId, i.feature].join(" ").toLowerCase().includes(q)));
  let html = "";
  for (const s of ["1", "2", "3", "4", "shared"]) {
    const inS = list.filter((i) => i.sprint === s);
    if (!inS.length) continue;
    html += "<h2>" + esc(NAMES[s]) + '<span class="count">' + inS.length + " ảnh</span></h2>";
    const byScreen = {};
    inS.forEach((i) => (byScreen[i.screenId] ||= []).push(i));
    for (const [id, arr] of Object.entries(byScreen)) {
      html += "<h3>" + esc(id + " · " + arr[0].title + " · " + arr[0].pbs.join(", ")) + '</h3><div class="grid">';
      for (const i of arr) html += '<figure><a href="' + esc(i.src) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(i.src) + '" alt="' + esc(i.title + " — " + i.state) + '"></a><figcaption><b>' + esc(i.state) + "</b><code>" + esc(i.file) + '</code><div class="tags">' + i.pbs.map((p) => '<span class="tag">' + esc(p) + "</span>").join("") + '<span class="tag m">' + esc(i.actor) + '</span><span class="tag m">' + esc(i.viewport + (i.full ? " · full" : "")) + '</span><span class="tag m">' + esc(i.route) + "</span></div></figcaption></figure>";
      html += "</div>";
    }
  }
  $("out").innerHTML = html || "<p>Không có ảnh khớp bộ lọc.</p>";
}
["q", "sprint", "actor", "vp"].forEach((id) => $(id).addEventListener("input", render));
render();
</script>
</body>
</html>
`;
write("gallery/index.html", gallery);

// ---------------------------------------------- README summary (markers) ---
// Counts only what the capture results + review actually contain.
const notCaptured = new Set([
  "BLOCKED_AUTH",
  "BLOCKED_API",
  "NOT_VERIFIED",
  "NOT_IMPLEMENTED",
  "ROUTE_NOT_FOUND",
]);
const s1 = existsSync(path.join(DIR, "sprint-01/capture-results.json"))
  ? read("sprint-01/capture-results.json")
  : null;
const rowsBySprint = SPRINTS.map((sp) => {
  const pbs = Object.values(backlog).filter((p) => p.sprint === sp);
  const scr = results.filter((r) => r.screen.sprint === sp);
  const routesSp = new Set(
    routes
      .filter((rt) => String(rt.routeSprint) === String(sp))
      .map((rt) => rt.path)
  );
  const shots =
    scr.reduce((n, r) => n + okShots(r).length, 0) +
    (sp === 1 && s1 ? s1.results.reduce((n, r) => n + r.files.length, 0) : 0);
  const missing = pbs
    .filter((p) => notCaptured.has(pbStatus(p.id)))
    .map((p) => p.id);
  const partial = pbs
    .filter((p) => pbStatus(p.id) === "PARTIALLY_CAPTURED")
    .map((p) => p.id);
  return `| Sprint ${sp} | ${pbs.length} | ${routesSp.size} | ${scr.length}${sp === 1 && s1 ? ` (+${new Set(s1.results.filter((r) => r.files.length).map((r) => r.id)).size} entry Sprint 1)` : ""} | ${shots} | ${missing.length}${missing.length ? ` (${missing.join(", ")})` : ""} | ${partial.length ? `Một phần: ${partial.join(", ")}` : "—"} |`;
});
const shared = results.filter((r) => r.screen.sprint === "shared");
const summary = `| Sprint | Tổng PB | Routes | Màn hình | Ảnh thành công | Chưa chụp / chưa xác minh | Vấn đề |
|---|---:|---:|---:|---:|---|---|
${rowsBySprint.join("\n")}
| Dùng chung / UNMAPPED | — | ${routes.filter((rt) => ["shell", "unassigned"].includes(String(rt.routeSprint))).length} | ${shared.length} | ${shared.reduce((n, r) => n + okShots(r).length, 0)} | — | Không có PB tương ứng |

*Routes* = route mà \`sprint-routes.ts\` gán cho Sprint đó. *Màn hình* = Screen ID trong bộ chụp toàn ứng dụng (Sprint 1 có thêm các entry chi tiết của \`sprint-01/\`). *Ảnh thành công* gồm cả ảnh \`sprint-01/\` cho Sprint 1. *Chưa chụp / chưa xác minh* = PB có trạng thái ${[...notCaptured].map((s) => `\`${s}\``).join(", ")}.

Trạng thái 96 PB: ${Object.entries(tally)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `\`${k}\` ${v}`)
  .join(" · ")}.`;
const readmePath = path.join(DIR, "README.md");
if (existsSync(readmePath)) {
  const readme = readFileSync(readmePath, "utf8");
  const next = readme.replace(
    /<!-- SUMMARY:START -->[\s\S]*<!-- SUMMARY:END -->/,
    `<!-- SUMMARY:START -->\n${summary}\n<!-- SUMMARY:END -->`
  );
  writeFileSync(readmePath, next);
}

console.log(
  `inventory rows=${invRows.length} gallery items=${items.length} coverage=${JSON.stringify(tally)}`
);
