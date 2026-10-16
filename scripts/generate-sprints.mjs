// Builds src/features/sprints/sprints.generated.json from the project docs, so
// the Sprint board never carries a hand-typed PBI list. Sources of truth:
//   docs/PRODUCT_BACKLOG_OFFICIAL.md  §2.3 (Sprint → PBI ids) + PBI headings
//   docs/PROJECT_PLAN.md              Sprint names and start/due dates
// Usage: node scripts/generate-sprints.mjs   (run again after the docs change)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const backlog = readFileSync(
  resolve(root, "docs/PRODUCT_BACKLOG_OFFICIAL.md"),
  "utf8"
);
const plan = readFileSync(resolve(root, "docs/PROJECT_PLAN.md"), "utf8");

const titles = {};
for (const m of backlog.matchAll(/^### 2\.1\.\d+ (PB\d+) - (.+)$/gm)) {
  titles[m[1]] = m[2].trim();
}

const start = backlog.indexOf("## 2.3. Chia theo từng Sprint");
if (start < 0) throw new Error("Section 2.3 (Chia theo từng Sprint) not found");
const section = backlog.slice(start);
const lines = section.split("\n");
const pbIdsBySprint = {};
let current = null;
for (const line of lines) {
  const head = line.match(/^\s+Sprint (\d+)\s/);
  if (head) current = Number(head[1]);
  if (current === null) continue;
  for (const m of line.matchAll(/PB\d+/g)) {
    (pbIdsBySprint[current] ??= []).push(m[0]);
  }
}

const toIso = (d) => d.split("/").reverse().join("-");
const planLines = plan.split("\n");
const meta = {};
planLines.forEach((line, i) => {
  const m = line.match(
    /^\s+3\.\d\s+Sprint (\d+) \((.*?)\s{2,}(\d\d\/\d\d\/\d{4})\s+(\d\d\/\d\d\/\d{4})/
  );
  if (!m) return;
  const tail = (planLines[i + 1] ?? "").trim().split(/\s{2,}/)[0];
  const name = `${m[2]} ${tail}`.replace(/\)\s*$/, "").trim();
  meta[Number(m[1])] = { name, startDate: toIso(m[3]), dueDate: toIso(m[4]) };
});

const sprints = Object.keys(pbIdsBySprint)
  .map(Number)
  .sort((a, b) => a - b)
  .map((id) => ({
    id,
    name: meta[id]?.name ?? null,
    startDate: meta[id]?.startDate ?? null,
    dueDate: meta[id]?.dueDate ?? null,
    pbis: pbIdsBySprint[id].map((pbId) => {
      if (!titles[pbId])
        throw new Error(`${pbId} has no heading in the backlog`);
      return { id: pbId, title: titles[pbId] };
    }),
  }));

const out = {
  generatedFrom: ["docs/PRODUCT_BACKLOG_OFFICIAL.md", "docs/PROJECT_PLAN.md"],
  sprints,
};
const target = resolve(
  root,
  "remotesea-web/src/features/sprints/sprints.generated.json"
);
writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
console.log(
  sprints
    .map(
      (s) =>
        `Sprint ${s.id}: ${s.pbis.length} PBIs, ${s.startDate} → ${s.dueDate}`
    )
    .join("\n")
);
