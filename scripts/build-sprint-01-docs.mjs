/**
 * build-sprint-01-docs.mjs — generated parts of docs/ui-design/sprint-01/.
 *
 * Inputs : scripts/manifests/sprint-01.json, docs/ui-design/data/product-backlog.json,
 *          docs/ui-design/sprint-01/capture-results.json (capture-sprint-01-ui.ts),
 *          docs/ui-design/sprint-01/data/pb-notes.json (hand-written per-PB notes)
 * Outputs: sprint-01-ui-capture-plan.md, sprint-01-screen-catalog.md,
 *          sprint-01-pb-coverage.md, sprint-01-capture-report.md, gallery/index.html
 * (README.md is hand-written.)  Usage: node scripts/build-sprint-01-docs.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "docs/ui-design/sprint-01");
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const write = (f, s) => {
  mkdirSync(path.dirname(path.join(DIR, f)), { recursive: true });
  writeFileSync(path.join(DIR, f), s);
};
const esc = (s) =>
  String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");

const manifest = json("scripts/manifests/sprint-01.json");
const backlog = json("docs/ui-design/data/product-backlog.json");
const cap = json("docs/ui-design/sprint-01/capture-results.json");
const notes = existsSync(path.join(DIR, "data/pb-notes.json"))
  ? json("docs/ui-design/sprint-01/data/pb-notes.json")
  : {};
const PBS = manifest.pbs;
const byId = Object.fromEntries(cap.results.map((r) => [r.id, r]));
const entriesFor = (pb) =>
  manifest.captures.filter((c) => (c.pbs ?? [c.pb]).includes(pb));
const resultsFor = (pb) =>
  entriesFor(pb)
    .map((c) => byId[c.id])
    .filter(Boolean);
const primaryFor = (pb) => cap.results.filter((r) => r.pb === pb);
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
const shotLink = (f, from = "screenshots") =>
  `[${path.posix.basename(f)}](${from}/${f})`;
const routesOf = (pb) => [...new Set(entriesFor(pb).map((c) => c.route))];
const screenKey = (c) => `${c.route.split(/[?#]/)[0].split(" ")[0]}`;

// UI status per PB (summary) — derived from the primary entries of that PB.
const pbStatus = (pb) => {
  if (notes[pb]?.status) return notes[pb].status;
  const rs = primaryFor(pb);
  if (!rs.length) return "NOT_VERIFIED";
  const ok = rs.filter((r) => r.ok);
  if (!ok.length) return "BLOCKED_API";
  if (ok.length < rs.length || rs.some((r) => r.verified === false))
    return "PARTIALLY_CAPTURED";
  const interactive = rs.some(
    (r) => manifest.captures.find((c) => c.id === r.id).steps.length > 1
  );
  return interactive
    ? "CAPTURED_AND_VERIFIED"
    : "CAPTURED_NOT_INTERACTION_TESTED";
};

// ---------------------------------------------------------------- plan ------
let plan = `# Sprint 1 — Kế hoạch chụp UI (PB01–PB22)

> Sinh từ \`scripts/manifests/sprint-01.json\` + \`docs/ui-design/data/product-backlog.json\` (trích \`docs/PRODUCT_BACKLOG_OFFICIAL.md\` §2.1, §2.3). Cột *Trạng thái* là kết quả lần chạy ${cap.generatedAt}.

Phiên chụp: **guest** (ngữ cảnh mới mỗi lần) · **seed-talent** (tài khoản seed, chỉ đọc) · **dt / de** (tài khoản Ứng viên / Nhà tuyển dụng dùng một lần do script tự đăng ký và tự xoá — mọi thao tác ghi chỉ diễn ra trên hai tài khoản này).

| PB ID | Tên PB chính thức | Actor (Backlog) | Tính năng | Route | Màn hình cần chụp | Trạng thái |
|---|---|---|---|---|---|---|
`;
for (const pb of PBS) {
  const p = backlog[pb];
  const es = entriesFor(pb);
  const feats =
    [...new Set(es.filter((c) => c.pb === pb).map((c) => c.feature))].join(
      ", "
    ) || [...new Set(es.map((c) => c.feature))].join(", ");
  plan += `| ${pb} | ${esc(p.title)} | ${esc(p.actor)} | ${feats} | ${routesOf(
    pb
  )
    .map((r) => `\`${r}\``)
    .join(
      "<br>"
    )} | ${es.map((c) => `${esc(c.title)}${c.pb !== pb ? ` *(chính: ${c.pb})*` : ""}`).join("<br>")} | \`${pbStatus(pb)}\` |\n`;
}
write("sprint-01-ui-capture-plan.md", plan);

// ------------------------------------------------------------- catalog ------
let cat = `# Sprint 1 — Screen Catalog

> Mỗi PB: phần **ghi chú** viết tay sau khi xem ảnh và đọc source (\`sprint-01/data/pb-notes.json\`); phần **ảnh & kiểm tra** sinh từ lần chạy ${cap.generatedAt}. Ký hiệu: ✅ đã chụp và mọi kiểm tra (URL/nội dung) đạt · 🟡 đã chụp, không khai báo kiểm tra · ⚠️ đã chụp nhưng kiểm tra không đạt · ❌ không chụp được.

`;
for (const pb of PBS) {
  const p = backlog[pb];
  const n = notes[pb] ?? {};
  cat += `## ${pb} — ${p.title}\n\n`;
  cat += `| | |\n|---|---|\n| **Tên tính năng** | ${esc(p.title)} |\n| **Actor (Backlog)** | ${esc(p.actor)} |\n| **Route** | ${routesOf(
    pb
  )
    .map((r) => `\`${r}\``)
    .join(
      ", "
    )} |\n| **Component** | ${esc(n.component ?? "—")} |\n| **Điều kiện truy cập** | ${esc(n.access ?? "—")} |\n| **Trạng thái UI** | \`${pbStatus(pb)}\` |\n\n`;
  cat += `**Mục đích.** ${n.purpose ?? p.description}\n\n`;
  if (n.layout) cat += `**Bố cục.** ${n.layout}\n\n`;
  if (n.interactions) cat += `**Tương tác đã xác minh.** ${n.interactions}\n\n`;
  if (n.gaps) cat += `**Chưa xác minh / khác biệt với AC.** ${n.gaps}\n\n`;
  cat += `| Screen ID | Màn hình / trạng thái | Actor · phiên | Ảnh | Kiểm tra |\n|---|---|---|---|---|\n`;
  for (const c of entriesFor(pb)) {
    const r = byId[c.id];
    const v = verdict(r);
    const files = r?.files?.length
      ? r.files.map((f) => shotLink(f)).join("<br>")
      : r?.evidence?.blockedRedirect
        ? `(không chụp — URL đích: \`${r.evidence.blockedRedirect}\`)`
        : r?.evidence?.failureShot
          ? `lỗi: ${shotLink(r.evidence.failureShot)}`
          : "—";
    const checks = r?.checks?.length
      ? r.checks
          .map((x) => `${x.pass ? "✔" : "✘"} ${esc(x.check)}`)
          .join("<br>")
      : "";
    cat += `| ${c.id}${c.pb !== pb ? ` *(PB chính ${c.pb})*` : ""} | ${esc(c.title)}${c.writes ? " · *ghi dữ liệu (tài khoản dùng một lần)*" : ""} | ${c.actor} · ${c.session}${c.viewport === "mobile" ? " · mobile" : ""} | ${files} | ${icon[v]} ${v}${checks ? "<br>" + checks : ""}${r?.error ? "<br>" + esc(r.error) : ""}${r?.evidence?.recovery ? "<br>*" + esc(r.evidence.recovery) + "*" : ""} |\n`;
  }
  const first =
    resultsFor(pb).find((r) => r.ok && r.files.length && r.pb === pb) ??
    resultsFor(pb).find((r) => r.ok && r.files.length);
  if (first) cat += `\n![${esc(p.title)}](screenshots/${first.files[0]})\n`;
  cat += "\n";
}
write("sprint-01-screen-catalog.md", cat);

// ------------------------------------------------------------ coverage ------
let cov = `# Sprint 1 — PB Coverage

> *Số màn hình* = số route/màn hình khác nhau có ảnh cho PB; *Số ảnh* = số file PNG thuộc các entry của PB (gồm ảnh full-page). *UI verified* = số entry đạt mọi kiểm tra / số entry có khai báo kiểm tra. Đây là bằng chứng **giao diện**, không thay thế kiểm thử chức năng (\`docs/SPRINT1_TEST_REPORT.md\`).

| PB ID | Acceptance Criteria | Route | Số màn hình | Số ảnh | UI verified | Ghi chú |
|---|---|---|---:|---:|---|---|
`;
const totals = { screens: new Set(), files: new Set() };
for (const pb of PBS) {
  const p = backlog[pb];
  const rs = resultsFor(pb);
  const files = new Set(rs.flatMap((r) => r.files));
  files.forEach((f) => totals.files.add(f));
  const screens = new Set(
    entriesFor(pb)
      .filter((c) => byId[c.id]?.files?.length)
      .map(screenKey)
  );
  screens.forEach((s) => totals.screens.add(s));
  const withChecks = rs.filter((r) => r.checks?.length);
  const ac = p.acceptance
    .map((a) => esc(a.length > 120 ? a.slice(0, 117) + "…" : a))
    .join("<br>");
  cov += `| ${pb} | ${ac} | ${routesOf(pb)
    .map((r) => `\`${r}\``)
    .join(
      "<br>"
    )} | ${screens.size} | ${files.size} | ${withChecks.filter((r) => r.verified).length}/${withChecks.length} · \`${pbStatus(pb)}\` | ${esc(notes[pb]?.coverageNote ?? "")} |\n`;
}
write("sprint-01-pb-coverage.md", cov);

// -------------------------------------------------------------- report ------
const rs = cap.results;
const failed = rs.filter((r) => !r.ok);
const checkFailed = rs.filter((r) => r.ok && r.verified === false);
const api = [...new Set(rs.flatMap((r) => r.apiErrors))];
let rep = `# Sprint 1 — Capture Report

| Hạng mục | Kết quả |
|---|---|
| Lần chạy | ${cap.generatedAt} (run \`${cap.runId}\`) |
| Base URL | \`${cap.baseUrl}\` · giới hạn ${cap.apiConcurrencyCap} request API đồng thời/tab |
| Entry trong manifest | ${manifest.captures.length} |
| Entry đã chạy | ${rs.length} (thành công ${rs.filter((r) => r.ok).length}, lỗi ${failed.length}) |
| Ảnh PNG | ${rs.reduce((n, r) => n + r.files.length, 0)} (không tính ảnh \`-FAILED\`) |
| Entry có kiểm tra & đạt | ${rs.filter((r) => r.verified).length}/${rs.filter((r) => r.checks?.length).length} |
| Entry có ghi dữ liệu | ${rs.filter((r) => r.writes).length} (đều trên tài khoản dùng một lần) |
| Tài khoản dùng một lần | Talent: \`${cap.disposableAccounts.talent}\` → ${cap.disposableAccounts.cleanup.dt}<br>Employer: \`${cap.disposableAccounts.employer}\` → ${cap.disposableAccounts.cleanup.de} |

## Entry lỗi

${failed.length ? "| Entry | PB | Lỗi | URL cuối | Ảnh lỗi |\n|---|---|---|---|---|\n" + failed.map((r) => `| ${r.id} | ${r.pb} | ${esc(r.error)} | \`${esc(r.finalUrl)}\` | ${r.evidence?.failureShot ? shotLink(r.evidence.failureShot, "screenshots") : "—"} |`).join("\n") : "Không có."}

## Entry chụp được nhưng kiểm tra không đạt

${
  checkFailed.length
    ? "| Entry | PB | Kiểm tra không đạt | URL cuối |\n|---|---|---|---|\n" +
      checkFailed
        .map(
          (r) =>
            `| ${r.id} | ${r.pb} | ${esc(
              r.checks
                .filter((c) => !c.pass)
                .map((c) => c.check)
                .join("; ")
            )} | \`${esc(r.finalUrl)}\` |`
        )
        .join("\n")
    : "Không có."
}

## Phục hồi phiên trong lúc chạy

${
  rs
    .filter((r) => r.evidence?.recovery)
    .map((r) => `- ${r.id}: ${r.evidence.recovery}`)
    .join("\n") || "Không cần."
}

## Lỗi API quan sát được (HTTP ≥ 400)

${
  api.length
    ? api
        .map(
          (a) =>
            `- \`${a}\` — ở: ${rs
              .filter((r) => r.apiErrors.includes(a))
              .map((r) => r.id)
              .join(", ")}`
        )
        .join("\n")
    : "Không có."
}

> Một số lỗi 4xx ở trên là **chủ đích** (sai mật khẩu, token giả, email trùng, mã 2FA sai…). Xem cột trạng thái trong \`sprint-01-screen-catalog.md\`.

## Còn thiếu

| PB | Màn hình / trạng thái chưa chụp | Nguyên nhân | Cách xử lý tiếp |
|---|---|---|---|
${PBS.flatMap((pb) => (notes[pb]?.missing ?? []).map((m) => `| ${pb} | ${esc(m.what)} | ${esc(m.why)} | ${esc(m.next ?? "")} |`)).join("\n") || "| — | — | — | — |"}

## PB không có thư mục ảnh riêng

${
  PBS.filter((pb) => !rs.some((r) => r.pb === pb && r.files.length))
    .map(
      (pb) =>
        `- **${pb}** — ${esc(
          notes[pb]?.noFolderReason ??
            "ảnh nằm ở PB chính khác: " +
              [
                ...new Set(
                  resultsFor(pb)
                    .filter((r) => r.files.length)
                    .map((r) => r.pb)
                ),
              ].join(", ")
        )}`
    )
    .join("\n") || "Không có — mọi PB đều có ảnh trong thư mục của mình."
}
`;
write("sprint-01-capture-report.md", rep);

// ------------------------------------------------------------- gallery ------
const items = rs.flatMap((r) =>
  r.files.map((f) => ({
    src: `../screenshots/${f}`,
    file: path.posix.basename(f),
    pb: r.pb,
    pbs: r.pbs,
    title: r.title,
    actor: r.actor,
    session: r.session,
    route: r.route,
    viewport: r.viewport,
    full: f.endsWith("-fullpage.png"),
    v: verdict(r),
  }))
);
const titles = Object.fromEntries(PBS.map((pb) => [pb, backlog[pb].title]));
write(
  "gallery/index.html",
  `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sprint 1 UI Gallery</title>
<style>
:root{--bg:#f8f7f4;--card:#fff;--fg:#1a1917;--muted:#5c5954;--line:#ddd9d1;--b50:#f0f9f4;--b7:#1f7a3d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 Inter,system-ui,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:16px}
h1{margin:0 0 4px;font-size:20px}header p{margin:0 0 10px;color:var(--muted);font-size:13px}
.c{display:flex;flex-wrap:wrap;gap:8px}input,select{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);min-width:0}input{flex:1 1 220px}
nav{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}nav a{font-size:12px;padding:2px 8px;border-radius:99px;background:var(--b50);color:var(--b7);text-decoration:none}
main{padding:16px;max-width:1440px;margin:0 auto}h2{font-size:16px;margin:26px 0 10px;scroll-margin-top:150px}h2 small{color:var(--muted);font-weight:400}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
figure a{display:block;background:#efede8;aspect-ratio:16/10;overflow:hidden}figure img{width:100%;height:100%;object-fit:cover;object-position:top}
figcaption{padding:10px 12px;font-size:12.5px}figcaption b{display:block}code{font-size:11px;color:var(--muted);word-break:break-all}
.t{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.t span{background:#efede8;color:var(--muted);border-radius:99px;padding:1px 8px;font-size:11px}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#1a1917;--card:#2c2a28;--fg:#f8f7f4;--muted:#c7c2b9;--line:#423f3c;--b50:#0d3d1f;--b7:#b8dfc0}}
</style></head><body>
<header><h1>RemoteSEA — Sprint 1 (PB01–PB22)</h1>
<p>${items.length} ảnh · chụp ${cap.generatedAt} từ <code>${cap.baseUrl}</code>. Bấm ảnh để mở kích thước gốc. ✅ đã kiểm tra · 🟡 đã chụp · ⚠️ kiểm tra không đạt.</p>
<div class="c"><input id="q" type="search" placeholder="Tìm theo PB, màn hình, route, trạng thái…">
<select id="a"><option value="">Mọi actor</option><option>guest</option><option>talent</option><option>employer</option></select>
<select id="vp"><option value="">Mọi viewport</option><option>desktop</option><option>mobile</option></select></div>
<nav>${PBS.map((pb) => `<a href="#${pb}">${pb}</a>`).join("")}</nav></header>
<main id="o"></main>
<script>
const I=${JSON.stringify(items)},T=${JSON.stringify(titles)},PB=${JSON.stringify(PBS)},IC={VERIFIED:"✅",CAPTURED:"🟡",CHECK_FAILED:"⚠️"};
const $=(i)=>document.getElementById(i),e=(s)=>String(s).replace(/[&<>"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
function r(){const q=$("q").value.trim().toLowerCase(),a=$("a").value,vp=$("vp").value;let h="";
for(const pb of PB){const l=I.filter((i)=>i.pbs.includes(pb)&&(!a||i.actor===a)&&(!vp||i.viewport===vp)&&(!q||[i.pb,i.pbs.join(" "),i.title,i.route,i.file,T[pb]].join(" ").toLowerCase().includes(q)));
h+='<h2 id="'+pb+'">'+pb+" — "+e(T[pb])+" <small>("+l.length+" ảnh)</small></h2>";
h+=l.length?'<div class="g">'+l.map((i)=>'<figure><a href="'+e(i.src)+'" target="_blank" rel="noopener"><img loading="lazy" src="'+e(i.src)+'" alt="'+e(i.title)+'"></a><figcaption><b>'+(IC[i.v]||"")+" "+e(i.title)+"</b><code>"+e(i.file)+'</code><div class="t"><span>'+e(i.actor)+"</span><span>"+e(i.viewport+(i.full?" · full page":""))+"</span><span>"+e(i.route)+"</span>"+(i.pbs.length>1?"<span>"+e(i.pbs.join(", "))+"</span>":"")+"</div></figcaption></figure>").join("")+"</div>":"<p>Không có ảnh chính cho PB này — xem sprint-01-screen-catalog.md.</p>";}
$("o").innerHTML=h;}
["q","a","vp"].forEach((i)=>$(i).addEventListener("input",r));r();
</script></body></html>
`
);
console.log(
  `sprint-01 docs: ${rs.length} entries, ${items.length} images, ${totals.screens.size} distinct screens`
);
