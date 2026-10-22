/**
 * build-pb15-pb20-docs.mjs — docs for docs/ui-design/sprint-01/pb15-pb20/.
 *
 * Inputs : scripts/manifests/sprint-01-pb15-pb20.json, docs/ui-design/data/product-backlog.json,
 *          <out>/capture-results.json (capture-sprint-01-ui.ts --manifest=…), <out>/data/pb-notes.json
 * Outputs: ui-capture-plan.md, screen-catalog.md, coverage-matrix.md, capture-report.md, gallery/index.html
 * (README.md is hand-written.)   Usage: node scripts/build-pb15-pb20-docs.mjs
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const manifest = json("scripts/manifests/sprint-01-pb15-pb20.json");
const OUT = path.join(ROOT, manifest.outDir);
const write = (f, s) => {
  mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true });
  writeFileSync(path.join(OUT, f), s);
};
const backlog = json("docs/ui-design/data/product-backlog.json");
const cap = json(path.join(manifest.outDir, "capture-results.json"));
const notes = existsSync(path.join(OUT, "data/pb-notes.json"))
  ? json(path.join(manifest.outDir, "data/pb-notes.json"))
  : {};
const PBS = manifest.pbs;
const esc = (s) =>
  String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
const byId = Object.fromEntries(cap.results.map((r) => [r.id, r]));
const entries = (pb) => manifest.captures.filter((c) => c.pb === pb);
const results = (pb) =>
  entries(pb)
    .map((c) => byId[c.id])
    .filter(Boolean);
const files = (pb) => results(pb).flatMap((r) => r.files);
const verdict = (r) =>
  !r
    ? "NOT_RUN"
    : !r.ok
      ? "FAILED"
      : r.verified === false
        ? "CHECK_FAILED"
        : r.verified
          ? "VERIFIED"
          : "CAPTURED";
const icon = {
  VERIFIED: "✅",
  CAPTURED: "🟡",
  CHECK_FAILED: "⚠️",
  FAILED: "❌",
  NOT_RUN: "⏸",
};
const link = (f) => `[${path.posix.basename(f)}](${f})`;
const routes = (pb) => [...new Set(entries(pb).map((c) => c.route))];
const screens = (pb) =>
  new Set(
    entries(pb)
      .filter((c) => byId[c.id]?.files?.length)
      .map(
        (c) =>
          c.route.split(/[?#]/)[0].split(" ")[0] +
          "#" +
          (c.route.split("#")[1] ?? "")
      )
  );
const status = (pb) =>
  notes[pb]?.status ??
  (() => {
    const rs = results(pb).filter(
      (r) => !manifest.captures.find((c) => c.id === r.id).noShot
    );
    if (!rs.length) return "NOT_VERIFIED";
    if (rs.every((r) => !r.ok)) return "BLOCKED_API";
    if (rs.some((r) => !r.ok || r.verified === false))
      return "PARTIALLY_CAPTURED";
    return "CAPTURED_AND_VERIFIED";
  })();

// ---------------------------------------------------------------- plan ------
let plan = `# PB15–PB20 — Kế hoạch chụp UI

> Sinh từ \`scripts/manifests/sprint-01-pb15-pb20.json\` + Product Backlog (\`docs/PRODUCT_BACKLOG_OFFICIAL.md\` §2.1). Trạng thái lấy từ lần chạy ${cap.generatedAt}.

Tất cả màn hình nằm trong **một route** \`/settings\` (\`src/features/settings/pages/SettingsPage.tsx\`, \`ProtectedRoute\` — mọi vai trò đã đăng nhập), mỗi PB là một mục (section) có anchor riêng. Mọi thao tác chạy trên tài khoản Ứng viên/Nhà tuyển dụng **dùng một lần** do script tự đăng ký và tự xoá.

| PB ID | Tên PB chính thức | Actor (Backlog) | Tính năng / section | Route | Màn hình & trạng thái cần chụp | Trạng thái |
|---|---|---|---|---|---|---|
`;
for (const pb of PBS) {
  plan += `| ${pb} | ${esc(backlog[pb].title)} | ${esc(backlog[pb].actor)} | ${esc(notes[pb]?.section ?? "")} | ${routes(
    pb
  )
    .map((r) => `\`${r}\``)
    .join("<br>")} | ${entries(pb)
    .map((c) => esc(c.title))
    .join("<br>")} | \`${status(pb)}\` |\n`;
}
write("ui-capture-plan.md", plan);

// -------------------------------------------------------------- catalog -----
let cat = `# PB15–PB20 — Screen Catalog

> Phần mô tả viết tay sau khi xem ảnh và đọc source (\`data/pb-notes.json\`); bảng ảnh và kết quả kiểm tra sinh từ lần chạy ${cap.generatedAt}. Ký hiệu kiểm tra: ✅ đạt mọi kiểm tra tự động · 🟡 đã chụp, không có kiểm tra tự động · ⚠️ kiểm tra không đạt · ❌ không chụp được. Nhãn **[Runtime]** = đã quan sát trên ứng dụng đang chạy; **[Source]** = suy ra từ mã nguồn, chưa thấy trên runtime.

`;
for (const pb of PBS) {
  const n = notes[pb] ?? {};
  const p = backlog[pb];
  cat += `## ${pb} — ${p.title}\n\n`;
  cat += `- **Sprint:** Sprint 1.\n- **Actor:** ${esc(p.actor)}${n.actorNote ? ` — ${n.actorNote}` : ""}\n- **Mục đích:** ${n.purpose ?? p.description}\n- **Route:** ${routes(
    pb
  )
    .map((r) => `\`${r}\``)
    .join(", ")}${n.component ? ` · component \`${n.component}\`` : ""}\n`;
  cat += `- **Danh sách màn hình:**\n${entries(pb)
    .map((c) => {
      const r = byId[c.id];
      return `  - ${esc(c.title)} — ${r?.files?.length ? r.files.map(link).join(", ") : r?.evidence?.blockedRedirect ? `không chụp (URL đích đã làm sạch: \`${r.evidence.blockedRedirect}\`)` : "—"}`;
    })
    .join("\n")}\n`;
  for (const [k, label] of [
    ["layout", "Bố cục UI"],
    ["interactive", "Thành phần tương tác"],
    ["flow", "Luồng sử dụng"],
    ["data", "Dữ liệu hiển thị"],
    ["states", "Trạng thái UI"],
    ["responsive", "Responsive"],
  ]) {
    if (n[k]) cat += `- **${label}:** ${n[k]}\n`;
  }
  cat += `- **Acceptance Criteria:**\n${p.acceptance.map((a) => `  - ${esc(a)}`).join("\n")}\n`;
  if (n.acCompare)
    cat += `- **Đối chiếu AC ↔ implementation:** ${n.acCompare}\n`;
  cat += `- **Bằng chứng:** ${files(pb).length} ảnh trong [\`${pb}/\`](${pb}/)${n.evidence ? "; " + n.evidence : ""}\n`;
  cat += `- **Trạng thái xác minh:** \`${status(pb)}\`${n.statusNote ? ` — ${n.statusNote}` : ""}\n\n`;
  cat += `| Entry | Trạng thái màn hình | Viewport | Ảnh | Kiểm tra |\n|---|---|---|---|---|\n`;
  for (const c of entries(pb)) {
    const r = byId[c.id];
    const v = verdict(r);
    cat += `| ${c.id} | ${esc(c.title)} | ${c.viewport ?? "desktop"}${c.shot ? " · section" : ""} | ${r?.files?.length ? r.files.map(link).join("<br>") : r?.evidence?.failureShot ? "lỗi: " + link(r.evidence.failureShot) : "—"} | ${icon[v]} ${v}${r?.checks?.length ? "<br>" + r.checks.map((x) => `${x.pass ? "✔" : "✘"} ${esc(x.check)}`).join("<br>") : ""}${r?.error ? "<br>" + esc(r.error) : ""}${r?.evidence?.recovery ? "<br>*" + esc(r.evidence.recovery) + "*" : ""} |\n`;
  }
  const first = results(pb).find((r) => r.files.length);
  if (first) cat += `\n![${esc(p.title)}](${first.files[0]})\n`;
  cat += "\n";
}
write("screen-catalog.md", cat);

// ------------------------------------------------------------- coverage -----
let cov = `# PB15–PB20 — Coverage Matrix

> *Số màn hình* = số khu vực giao diện khác nhau có ảnh (route + section); *Số ảnh* = số file PNG trong thư mục PB (gồm ảnh full-page/section). Trạng thái theo bộ chuẩn của tài liệu. Đã chụp ≠ đã kiểm thử chức năng (xem \`docs/SPRINT1_TEST_REPORT.md\`).

| PB ID | Tên tính năng | Routes | Số màn hình | Số ảnh | Trạng thái | Ghi chú |
|---|---|---|---:|---:|---|---|
`;
for (const pb of PBS)
  cov += `| ${pb} | ${esc(backlog[pb].title)} | ${routes(pb)
    .map((r) => `\`${r}\``)
    .join(
      "<br>"
    )} | ${screens(pb).size} | ${files(pb).length} | \`${status(pb)}\` | ${esc(notes[pb]?.coverageNote ?? "")} |\n`;
cov += `\n**Tổng:** ${PBS.reduce((n, pb) => n + files(pb).length, 0)} ảnh cho 6 PB.\n`;
write("coverage-matrix.md", cov);

// --------------------------------------------------------------- report -----
const rs = cap.results;
const shotEntries = rs.filter(
  (r) => !manifest.captures.find((c) => c.id === r.id)?.noShot
);
const allFiles = rs.flatMap((r) => r.files);
const blank = allFiles.filter((f) => statSync(path.join(OUT, f)).size < 15_000);
const api = [...new Set(rs.flatMap((r) => r.apiErrors))];
let rep = `# PB15–PB20 — Capture Report

| Hạng mục | Kết quả |
|---|---|
| Lần chạy | ${cap.generatedAt} (run \`${cap.runId}\`) |
| Base URL | \`${cap.baseUrl}\` · tối đa ${cap.apiConcurrencyCap} request API đồng thời/tab |
| Entry trong manifest | ${manifest.captures.length} (${shotEntries.length} entry chụp ảnh, ${manifest.captures.length - shotEntries.length} entry chuẩn bị/bằng chứng không ảnh) |
| Entry thành công | ${rs.filter((r) => r.ok).length}/${rs.length} |
| Kiểm tra tự động đạt | ${rs.filter((r) => r.verified).length}/${rs.filter((r) => r.checks?.length).length} entry có kiểm tra |
| Ảnh PNG | ${allFiles.length} — ${PBS.map((pb) => `${pb}: ${files(pb).length}`).join(" · ")} |
| Ảnh nghi trắng (< 15 KB) | ${blank.length ? blank.map(link).join(", ") : "không có"} |
| Tài khoản dùng một lần | Talent \`${cap.disposableAccounts.talent}\` → ${cap.disposableAccounts.cleanup.dt}<br>Employer \`${cap.disposableAccounts.employer}\` → ${cap.disposableAccounts.cleanup.de} |

## Entry lỗi hoặc kiểm tra không đạt

${
  rs
    .filter((r) => !r.ok || r.verified === false)
    .map(
      (r) =>
        `- **${r.id}** (${r.pb}): ${
          r.ok
            ? "kiểm tra không đạt — " +
              r.checks
                .filter((c) => !c.pass)
                .map((c) => c.check)
                .join("; ")
            : esc(r.error)
        }${r.evidence?.failureShot ? ` · ảnh lỗi ${link(r.evidence.failureShot)}` : ""}`
    )
    .join("\n") || "Không có."
}

## Lỗi API quan sát được (HTTP ≥ 400)

${
  api
    .map(
      (a) =>
        `- \`${a}\` — ${rs
          .filter((r) => r.apiErrors.includes(a))
          .map((r) => r.id)
          .join(", ")}`
    )
    .join("\n") || "Không có."
}

## Trạng thái mô phỏng (không phải lỗi thật của server)

${manifest.captures
  .filter((c) => /simulated/.test(c.state))
  .map((c) => `- ${c.id}: ${esc(c.title)}`)
  .join("\n")}

## Còn thiếu

| PB | Màn hình / trạng thái | Nguyên nhân | Cách xử lý tiếp |
|---|---|---|---|
${PBS.flatMap((pb) => (notes[pb]?.missing ?? []).map((m) => `| ${pb} | ${esc(m.what)} | ${esc(m.why)} | ${esc(m.next ?? "")} |`)).join("\n") || "| — | — | — | — |"}
`;
write("capture-report.md", rep);

// -------------------------------------------------------------- gallery -----
const items = rs.flatMap((r) =>
  r.files.map((f) => ({
    src: `../${f}`,
    file: path.posix.basename(f),
    pb: r.pb,
    title: r.title,
    actor: r.actor,
    route: r.route,
    viewport: r.viewport,
    full: /fullpage/.test(f),
    v: verdict(r),
  }))
);
const T = Object.fromEntries(PBS.map((pb) => [pb, backlog[pb].title]));
write(
  "gallery/index.html",
  `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>PB15–PB20 UI Gallery</title>
<style>
:root{--bg:#f8f7f4;--card:#fff;--fg:#1a1917;--muted:#5c5954;--line:#ddd9d1;--b50:#f0f9f4;--b7:#1f7a3d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:16px}
h1{margin:0 0 4px;font-size:20px}header p{margin:0 0 10px;color:var(--muted);font-size:13px}
.c{display:flex;flex-wrap:wrap;gap:8px}input,select{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);min-width:0}input{flex:1 1 220px}
nav{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}nav a{font-size:12px;padding:2px 8px;border-radius:99px;background:var(--b50);color:var(--b7);text-decoration:none}
main{padding:16px;max-width:1440px;margin:0 auto}h2{font-size:16px;margin:26px 0 4px;scroll-margin-top:150px}.meta{color:var(--muted);font-size:12.5px;margin:0 0 10px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
figure a{display:block;background:#efede8;aspect-ratio:16/10;overflow:hidden}figure img{width:100%;height:100%;object-fit:cover;object-position:top}
figcaption{padding:10px 12px;font-size:12.5px}figcaption b{display:block}code{font-size:11px;color:var(--muted);word-break:break-all}
.t{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.t span{background:#efede8;color:var(--muted);border-radius:99px;padding:1px 8px;font-size:11px}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#1a1917;--card:#2c2a28;--fg:#f8f7f4;--muted:#c7c2b9;--line:#423f3c;--b50:#0d3d1f;--b7:#b8dfc0}}
</style></head><body>
<header><h1>RemoteSEA — Sprint 1 · PB15–PB20 (Cài đặt tài khoản)</h1>
<p>${items.length} ảnh · chụp ${cap.generatedAt} · route <code>/settings</code>. Bấm ảnh để mở ảnh gốc. ✅ đã kiểm tra · 🟡 đã chụp · ⚠️ kiểm tra không đạt.</p>
<div class="c"><input id="q" type="search" placeholder="Tìm theo PB, trạng thái, tên file…"><select id="vp"><option value="">Mọi viewport</option><option>desktop</option><option>mobile</option></select><select id="a"><option value="">Mọi actor</option><option>talent</option><option>employer</option><option>guest</option></select></div>
<nav>${PBS.map((pb) => `<a href="#${pb}">${pb}</a>`).join("")}</nav></header>
<main id="o"></main>
<script>
const I=${JSON.stringify(items)},T=${JSON.stringify(T)},PB=${JSON.stringify(PBS)},IC={VERIFIED:"✅",CAPTURED:"🟡",CHECK_FAILED:"⚠️"};
const $=(i)=>document.getElementById(i),e=(s)=>String(s).replace(/[&<>"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
function r(){const q=$("q").value.trim().toLowerCase(),vp=$("vp").value,a=$("a").value;let h="";
for(const pb of PB){const l=I.filter((i)=>i.pb===pb&&(!vp||i.viewport===vp)&&(!a||i.actor===a)&&(!q||[i.pb,i.title,i.file,i.route,T[pb]].join(" ").toLowerCase().includes(q)));
h+='<h2 id="'+pb+'">'+pb+" — "+e(T[pb])+'</h2><p class="meta">'+l.length+" ảnh · route /settings</p>";
h+='<div class="g">'+l.map((i)=>'<figure><a href="'+e(i.src)+'" target="_blank" rel="noopener"><img loading="lazy" src="'+e(i.src)+'" alt="'+e(i.title)+'"></a><figcaption><b>'+(IC[i.v]||"")+" "+e(i.title)+"</b><code>"+e(i.file)+'</code><div class="t"><span>'+e(i.actor)+"</span><span>"+e(i.viewport+(i.full?" · full":""))+"</span><span>"+e(i.route)+"</span></div></figcaption></figure>").join("")+"</div>";}
$("o").innerHTML=h;}
["q","vp","a"].forEach((i)=>$(i).addEventListener("input",r));r();
</script></body></html>
`
);
console.log(
  `pb15-pb20 docs: ${rs.length} entries, ${items.length} images; per PB ${PBS.map((pb) => pb + "=" + files(pb).length).join(" ")}`
);
