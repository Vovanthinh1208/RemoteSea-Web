/**
 * capture-sprint-01-ui.ts — Sprint 1 (PB01–PB22) UI evidence capture.
 *
 * Runs the ordered entries of scripts/manifests/sprint-01.json against the
 * real app and writes docs/ui-design/sprint-01/screenshots/PBxx/*.png plus
 * docs/ui-design/sprint-01/capture-results.json (input of
 * scripts/build-sprint-01-docs.mjs).
 *
 * Data safety:
 *  - Seed accounts (session seed-*) are used READ-ONLY; the runner refuses an
 *    entry with writes=true on any session other than dt / de.
 *  - dt / de are disposable accounts this run registers itself
 *    (e2e-ui-s1-<run>-talent|employer@example.com) and deletes at the end —
 *    through the UI (PB20 entries) or, if that did not happen, via
 *    DELETE /users/me in a finally block.
 *  - Their passwords are random per run and never written anywhere.
 *  - OAuth provider hosts are blocked (the redirect target is only recorded);
 *    nothing is paid; the only e-mails possible go to @example.com.
 *
 * Usage (Node >= 22.6):
 *   CAPTURE_PASSWORD=<seed password> node scripts/capture-sprint-01-ui.ts
 *   CAPTURE_PASSWORD=... node scripts/capture-sprint-01-ui.ts --only=PB06,PB07
 *     (--only filters guest/seed entries; dt/de entries always run because
 *      each depends on the previous one — register → … → delete)
 *   node scripts/build-sprint-01-docs.mjs
 */
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_URL,
  BASE_URL,
  TOKEN_KEY,
  API_CONCURRENCY,
  loginInPage,
  loginViaUi,
  maskFor,
  newContext,
  settle,
  throttleApi,
  totp,
  type StorageState,
} from "./lib/capture-kit.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);
// --manifest=scripts/manifests/sprint-01-pb15-pb20.json picks another capture set;
// the manifest may set outDir / shotsDir (relative to the repo) and naming.
const MANIFEST_PATH = path.resolve(
  ROOT,
  String(args.manifest ?? "scripts/manifests/sprint-01.json")
);
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const OUT = path.join(ROOT, manifest.outDir ?? "docs/ui-design/sprint-01");
const SHOTS = path.join(
  ROOT,
  manifest.shotsDir ??
    path.join(manifest.outDir ?? "docs/ui-design/sprint-01", "screenshots")
);
const ONLY: string[] | null = args.only ? String(args.only).split(",") : null;

type Step = Record<string, any>;
interface Entry {
  id: string;
  pb: string;
  pbs?: string[];
  actor: string;
  session: string;
  feature: string;
  state: string;
  title: string;
  route: string;
  viewport?: "desktop" | "mobile";
  full?: boolean;
  noShot?: boolean;
  writes?: boolean;
  shot?: { selector: string; parent?: boolean };
  steps: Step[];
  expect?: Step[];
  marksDeleted?: string;
  noAuthCheck?: boolean; // entry is signed out on purpose (2FA challenge)
  noSettle?: boolean; // capture mid-request (loading state)
  createsAccount?: "dt" | "de"; // this entry's success means the disposable account exists
}
interface Result {
  id: string;
  pb: string;
  pbs: string[];
  actor: string;
  session: string;
  feature: string;
  state: string;
  title: string;
  route: string;
  viewport: string;
  writes: boolean;
  files: string[];
  bytes: number[];
  finalUrl: string;
  ok: boolean;
  verified: boolean | null;
  checks: Array<{ check: string; pass: boolean }>;
  error?: string;
  apiErrors: string[];
  evidence: Record<string, string>;
}

// ---------------------------------------------------------------- vars -------
const RUN_ID = Date.now().toString(36);
const strongPassword = () => `Ui!${randomBytes(9).toString("base64url")}9a`;
const SECRET_VARS = new Set([
  "DT_PASSWORD",
  "DT_PASSWORD_NEW",
  "DE_PASSWORD",
  "SEED_PASSWORD",
  "DT_TOTP_SECRET",
]);
const vars: Record<string, string> = {
  RUN_ID,
  DT_EMAIL: `e2e-ui-s1-${RUN_ID}-talent@example.com`,
  DE_EMAIL: `e2e-ui-s1-${RUN_ID}-employer@example.com`,
  DT_PASSWORD: strongPassword(),
  DT_PASSWORD_NEW: strongPassword(),
  DE_PASSWORD: strongPassword(),
  SEED_TALENT_EMAIL:
    process.env.CAPTURE_TALENT_EMAIL ?? "talent1@remotesea.dev",
  SEED_EMPLOYER_EMAIL:
    process.env.CAPTURE_EMPLOYER_EMAIL ?? "employer1@remotesea.dev",
  SEED_PASSWORD: process.env.CAPTURE_PASSWORD ?? "",
};
const sub = (s: string) => s.replace(/\$\{(\w+)\}/g, (_, k) => vars[k] ?? "");
const redact = (s: string) => {
  let out = s;
  for (const k of SECRET_VARS)
    if (vars[k]) out = out.split(vars[k]).join(`<${k}>`);
  return out;
};

// -------------------------------------------------------------- sessions -----
const sessions = new Map<string, { ctx: BrowserContext; page: Page }>();
const seedStorage = new Map<string, StorageState>();
const created = { dt: false, de: false };
const deleted = { dt: false, de: false };
const blockedUrls: string[] = [];
let downloadName = "";

const sessionPage = async (
  browser: Browser,
  e: Entry
): Promise<{ page: Page; transient: boolean }> => {
  const mobile = e.viewport === "mobile";
  if (e.session === "guest" || e.session.startsWith("seed-") || mobile) {
    let storageState: StorageState | undefined;
    if (e.session.startsWith("seed-")) {
      if (!vars.SEED_PASSWORD)
        throw new Error("BLOCKED_AUTH: CAPTURE_PASSWORD not set");
      if (!seedStorage.has(e.session)) {
        const email =
          e.session === "seed-talent"
            ? vars.SEED_TALENT_EMAIL
            : vars.SEED_EMPLOYER_EMAIL;
        seedStorage.set(
          e.session,
          (await loginViaUi(browser, email, vars.SEED_PASSWORD)).storage
        );
      }
      storageState = seedStorage.get(e.session);
    } else if (mobile && sessions.has(e.session)) {
      storageState = await sessions.get(e.session)!.ctx.storageState();
    }
    const ctx = await newContext(browser, { mobile, storageState });
    return { page: await ctx.newPage(), transient: true };
  }
  if (!sessions.has(e.session)) {
    const ctx = await newContext(browser);
    sessions.set(e.session, { ctx, page: await ctx.newPage() });
  }
  return { page: sessions.get(e.session)!.page, transient: false };
};

// The API's concurrency 401s (docs/ui-design/issues-and-gaps.md A1) make the
// app drop its token mid-chain. Before every entry that needs the disposable
// account signed in, put the session back (answering 2FA if it is on).
let twoFactorOn = false;
const ensureDisposableSession = async (
  page: Page,
  which: "dt" | "de",
  log: string[]
) => {
  if (!page.url().startsWith(BASE_URL)) await page.goto(BASE_URL + "/jobs");
  const has = await page.evaluate(
    (k) => !!(localStorage.getItem(k) ?? sessionStorage.getItem(k)),
    TOKEN_KEY
  );
  if (has) return;
  log.push(
    "no session at entry start (app signed out — e.g. pause/revoke, or an API 401) — signed in again via /login"
  );
  await loginInPage(
    page,
    vars[which === "de" ? "DE_EMAIL" : "DT_EMAIL"],
    vars[which === "de" ? "DE_PASSWORD" : "DT_PASSWORD"]
  );
  if (which === "dt" && twoFactorOn) {
    await page
      .locator("input[inputmode=numeric]")
      .first()
      .waitFor({ timeout: 15_000 });
    await page.locator("input[inputmode=numeric]").first().click();
    await page.keyboard.type(await totp(vars.DT_TOTP_SECRET), { delay: 60 });
  }
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), {
    timeout: 20_000,
  });
  await settle(page);
};

// unrouteAll() also drops the concurrency throttle — put it back.
const throttleApiFor = (page: Page) => throttleApi(page.context());

// ----------------------------------------------------------------- steps -----
const locate = (page: Page, s: Step) => {
  const nth = (l: ReturnType<Page["locator"]>) =>
    s.nth === -1 ? l.last() : l.nth(s.nth ?? 0);
  if (s.selector) {
    const base = page.locator(s.selector);
    return nth(
      s.name && !/^\^/.test(s.name)
        ? base.filter({ hasText: new RegExp(s.name, "i") })
        : base
    );
  }
  return nth(
    page.getByRole(
      s.role ?? "button",
      s.name ? { name: new RegExp(s.name, "i") } : {}
    )
  );
};

const runStep = async (browser: Browser, page: Page, step: Step, e: Entry) => {
  const [op, raw] = Object.entries(step)[0];
  const v = typeof raw === "string" ? sub(raw) : raw;
  switch (op) {
    case "goto":
      await page.goto(BASE_URL + v, { waitUntil: "domcontentloaded" });
      await settle(page);
      break;
    // No settle: for states that only live a few seconds after load (toasts).
    case "gotoFast":
      await page.goto(BASE_URL + v, { waitUntil: "domcontentloaded" });
      break;
    case "click": {
      const el = locate(page, v);
      if (v.optional && !(await el.isVisible().catch(() => false))) break;
      await el.scrollIntoViewIfNeeded();
      await el.click();
      await settle(page);
      break;
    }
    case "clickNoWait":
      await locate(page, v).click();
      break; // to catch an in-flight state
    case "fill":
      await page.locator(v.selector).first().fill(sub(v.value));
      break;
    case "type": {
      const el = page.locator(v.selector).first();
      await el.click();
      await page.keyboard.type(sub(v.value), { delay: 60 });
      break;
    }
    case "clear":
      await page.locator(v).first().fill("");
      break;
    case "press":
      await page.keyboard.press(v);
      break;
    case "scrollTo":
      await page
        .locator(v)
        .first()
        .scrollIntoViewIfNeeded()
        .catch(() => {});
      // block:start alone tucks the section heading under the 56px sticky navbar.
      await page.evaluate((sel) => {
        document.querySelector(sel)?.scrollIntoView({ block: "start" });
        window.scrollBy(0, -72);
      }, v);
      await page.waitForTimeout(400);
      break;
    case "wait":
      await page.waitForTimeout(v);
      break;
    case "waitUrl":
      await page.waitForURL((u) => new RegExp(v).test(u.pathname + u.search), {
        timeout: 20_000,
      });
      await settle(page);
      break;
    case "waitText":
      await page
        .getByText(new RegExp(v, "i"))
        .first()
        .waitFor({ timeout: 20_000 });
      await page.waitForTimeout(300);
      break;
    case "read":
      vars[v.var] = (
        (await page.locator(v.selector).first().textContent()) ?? ""
      ).trim();
      break;
    case "totp": {
      if (v.freshWindow) {
        const left = 30 - (Math.floor(Date.now() / 1000) % 30);
        if (left < 6) await page.waitForTimeout((left + 1) * 1000);
      }
      const code = await totp(vars[v.var]);
      const el = page.locator(v.into).first();
      await el.click();
      await el.fill("").catch(() => {});
      await page.keyboard.type(code, { delay: 60 });
      break;
    }
    case "setVar":
      vars[v.name] = sub(v.value);
      break;
    case "localStorage":
      await page.evaluate(
        ([k, val]) => localStorage.setItem(k, val),
        [v.key, sub(v.value)]
      );
      break;
    case "select": {
      const el = page.locator(v.selector).nth(v.nth ?? 0);
      await el.selectOption({ label: v.label });
      break;
    }
    case "blockHosts": {
      for (const host of v as string[]) {
        await page
          .context()
          .route(
            new RegExp(`^https?://${host.replace(/\./g, "\\.")}/`),
            (route) => {
              // Keep provider + path and whether client_id is set; drop state/redirect
              // values (the OAuth state is a signed token tied to the account).
              const u = new URL(route.request().url());
              blockedUrls.push(
                `${u.origin}${u.pathname}?client_id=${u.searchParams.get("client_id") ? "<set>" : "<EMPTY>"}`
              );
              return route.abort();
            }
          );
      }
      break;
    }
    case "download": {
      const [dl] = await Promise.all([
        page.waitForEvent("download", { timeout: 15_000 }),
        locate(page, { name: v.name }).click(),
      ]);
      downloadName = dl.suggestedFilename();
      await dl.delete(); // personal data — never kept
      break;
    }
    case "login": {
      await loginInPage(page, sub(v.email), sub(v.password));
      await page.waitForTimeout(500);
      await settle(page);
      break;
    }
    case "ensureLoggedIn": {
      const has = await page.evaluate(
        (k) => !!(localStorage.getItem(k) ?? sessionStorage.getItem(k)),
        TOKEN_KEY
      );
      if (!has) {
        await loginInPage(
          page,
          vars[v === "de" ? "DE_EMAIL" : "DT_EMAIL"],
          vars[v === "de" ? "DE_PASSWORD" : "DT_PASSWORD"]
        );
        await page.waitForURL((u) => !u.pathname.startsWith("/login"), {
          timeout: 20_000,
        });
        await settle(page);
      }
      break;
    }
    case "extraSession": {
      // A second, separate login of the disposable account (PB19). With
      // {"of":"dt","as":"dt2"} the new session is kept as its own session
      // name so later entries can show what happens to it after a revoke.
      const of = typeof v === "string" ? v : v.of;
      const { storage } = await loginViaUi(
        browser,
        vars[of === "de" ? "DE_EMAIL" : "DT_EMAIL"],
        vars[of === "de" ? "DE_PASSWORD" : "DT_PASSWORD"]
      );
      if (typeof v === "object" && v.as) {
        const ctx = await newContext(browser, { storageState: storage });
        sessions.set(v.as, { ctx, page: await ctx.newPage() });
      }
      break;
    }
    case "failApi": {
      // Simulated network failure for ONE endpoint, to show the UI's real
      // error handling (toast) without breaking anything server-side. Always
      // labelled "network-error-simulated" in the manifest/docs.
      const re = new RegExp(
        `^${API_URL.replace(/[.:/]/g, (c) => "\\" + c)}${v.path}(\\?|$)`
      );
      await page
        .context()
        .route(re, (route) =>
          !v.method || route.request().method() === v.method
            ? route.abort("failed")
            : route.fallback()
        );
      break;
    }
    case "delayApi": {
      // Simulated slow response for ONE endpoint so the in-flight (loading)
      // state stays on screen long enough to capture. Labelled in the docs.
      const re = new RegExp(
        `^${API_URL.replace(/[.:/]/g, (c) => "\\" + c)}${v.path}(\\?|$)`
      );
      await page.context().route(re, async (route) => {
        if (v.method && route.request().method() !== v.method)
          return route.fallback();
        await new Promise((r) => setTimeout(r, v.ms ?? 3000));
        return route.fallback();
      });
      break;
    }
    case "scrollToText": {
      const el = page.getByText(new RegExp(v, "i")).first();
      await el.scrollIntoViewIfNeeded();
      await el.evaluate((n) => {
        n.scrollIntoView({ block: "start" });
        window.scrollBy(0, -88);
      });
      await page.waitForTimeout(400);
      break;
    }
    case "clearFailApi":
      await page.context().unrouteAll({ behavior: "ignoreErrors" });
      await throttleApiFor(page);
      break;
    default:
      throw new Error(`unknown step ${op} in ${e.id}`);
  }
};

const runChecks = async (page: Page, expect: Step[] = []) => {
  const out: Array<{ check: string; pass: boolean }> = [];
  for (const x of expect) {
    const [k, raw] = Object.entries(x)[0];
    const v = sub(String(raw));
    const url = new URL(page.url());
    let pass = false;
    if (k === "url") pass = new RegExp(v).test(url.pathname + url.search);
    else if (k === "notUrl")
      pass = !new RegExp(v).test(url.pathname + url.search);
    // Visible matches only — the same label often also exists in a hidden
    // (mobile-only / collapsed) copy of the markup, which made .first() lie.
    else if (k === "text")
      pass =
        (await page
          .getByText(new RegExp(v, "i"))
          .filter({ visible: true })
          .count()) > 0;
    else if (k === "notText")
      pass =
        (await page
          .getByText(new RegExp(v, "i"))
          .filter({ visible: true })
          .count()) === 0;
    else if (k === "blocked")
      pass = blockedUrls.some((u) => new RegExp(v).test(u));
    else if (k === "downloaded") pass = new RegExp(v).test(downloadName);
    else if (k === "attr") {
      // {"attr": "<selector>|<attribute>|<expected>"} — e.g. a switch's aria-checked.
      const [sel, attr, want] = v.split("|");
      pass =
        (await page
          .locator(sel)
          .first()
          .getAttribute(attr)
          .catch(() => null)) === (want === "null" ? null : want);
    } else if (k === "storageCleared")
      pass = await page.evaluate(
        (key) => !localStorage.getItem(key) && !sessionStorage.getItem(key),
        v
      );
    out.push({ check: `${k}: ${v}`, pass });
  }
  return out;
};

class RetryEntry extends Error {}

// ----------------------------------------------------------------- main ------
const fileName = (e: Entry, suffix = "") =>
  manifest.naming === "pb-feature-state"
    ? `${e.pb}-${e.feature}-${e.state}${suffix}.png`
    : `${e.pb}-${e.actor}-${e.feature}-${e.state}${suffix}.png`;

const deleteViaApi = async (which: "dt" | "de") => {
  const email = which === "dt" ? vars.DT_EMAIL : vars.DE_EMAIL;
  for (const pw of which === "dt"
    ? [vars.DT_PASSWORD, vars.DT_PASSWORD_NEW]
    : [vars.DE_PASSWORD]) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    });
    if (!res.ok) continue;
    const body = await res.json();
    if (!body.accessToken) return `login needs 2FA — delete ${email} manually`;
    const del = await fetch(`${API_URL}/users/me`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${body.accessToken}`,
      },
      body: JSON.stringify({ password: pw, confirmation: "DELETE" }),
    });
    return del.ok ? "deleted via API" : `DELETE /users/me -> ${del.status}`;
  }
  return "could not log in (already deleted?)";
};

const main = async () => {
  const disposable = (e: Entry) => ["dt", "de"].includes(e.session);
  const entries: Entry[] = manifest.captures.filter((e: Entry) =>
    disposable(e)
      ? !args["no-disposable"]
      : !ONLY || ONLY.includes(e.pb) || ONLY.includes(e.id)
  );
  for (const e of entries) {
    if (e.writes && !["dt", "de"].includes(e.session))
      throw new Error(
        `${e.id}: writes=true is only allowed on disposable sessions`
      );
  }
  // Only the per-PB image folders are regenerated — never the docs next to them.
  if (!ONLY)
    for (const pb of manifest.pbs as string[])
      rmSync(path.join(SHOTS, pb), { recursive: true, force: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results: Result[] = [];
  const cleanup: Record<string, string> = {};
  const dtCreateIdx = entries.findIndex((x) => x.createsAccount === "dt");
  try {
    const retried = new Set<string>();
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      process.stdout.write(`${e.id} ... `);
      const apiErrors: string[] = [];
      const r: Result = {
        id: e.id,
        pb: e.pb,
        pbs: e.pbs ?? [e.pb],
        actor: e.actor,
        session: e.session,
        feature: e.feature,
        state: e.state,
        title: e.title,
        route: e.route,
        viewport: e.viewport ?? "desktop",
        writes: !!e.writes,
        files: [],
        bytes: [],
        finalUrl: "",
        ok: false,
        verified: null,
        checks: [],
        apiErrors,
        evidence: {},
      };
      if (retried.has(e.id))
        r.evidence.retried =
          "transient context was signed out (API 401) — entry retried once";
      let page: Page | null = null;
      let transient = false;
      try {
        // Everything after the dt registration depends on it having worked.
        if (e.session === "dt" && !created.dt && i > dtCreateIdx)
          throw new Error(
            "disposable Talent not created (earlier step failed)"
          );
        ({ page, transient } = await sessionPage(browser, e));
        const w = e.session as "dt" | "de";
        if (
          (w === "dt" || w === "de") &&
          !transient &&
          created[w] &&
          !deleted[w] &&
          e.actor !== "guest" &&
          !e.noAuthCheck
        ) {
          const notes: string[] = [];
          await ensureDisposableSession(page, w, notes);
          if (notes.length) r.evidence.recovery = notes.join("; ");
        }
        const onResp = (res: Awaited<ReturnType<Page["waitForResponse"]>>) => {
          if (res.url().startsWith(API_URL) && res.status() >= 400)
            apiErrors.push(
              `${res.request().method()} ${new URL(res.url()).pathname} -> ${res.status()}`
            );
        };
        page.on("response", onResp);
        for (const s of e.steps)
          await runStep(browser, page, s, e).catch(async (err) => {
            // A fresh (transient) context occasionally gets signed out by the
            // API's concurrency 401 (issues A1) — retry the whole entry once.
            if (
              transient &&
              e.actor !== "guest" &&
              new URL(page!.url()).pathname === "/login" &&
              !retried.has(e.id)
            ) {
              throw new RetryEntry();
            }
            throw err;
          });
        if (!e.noSettle) await settle(page);
        if (e.id === "PB10-2fa-backup-codes") twoFactorOn = true;
        if (e.id === "PB11-2fa-disabled") twoFactorOn = false;
        if (e.createsAccount) created[e.createsAccount] = true;
        r.finalUrl = redact(page.url().replace(BASE_URL, ""));
        r.checks = await runChecks(page, e.expect);
        r.verified = r.checks.length ? r.checks.every((c) => c.pass) : null;
        if (!e.noShot) {
          const dir = path.join(SHOTS, e.pb);
          mkdirSync(dir, { recursive: true });
          const shots: Array<[string, boolean]> = [[fileName(e), false]];
          if (e.full) shots.push([fileName(e, "-fullpage"), true]);
          for (const [f, full] of shots) {
            const target = path.join(dir, f);
            if (e.shot?.selector) {
              let el = page.locator(e.shot.selector).first();
              if (e.shot.parent) el = el.locator("xpath=..");
              await el.screenshot({
                path: target,
                animations: "disabled",
                mask: maskFor(page),
              });
            } else {
              await page.screenshot({
                path: target,
                fullPage: full,
                animations: "disabled",
                mask: maskFor(page),
                maskColor: "#d4d4d8",
              });
            }
            r.files.push(path.posix.join(e.pb, f));
            r.bytes.push(statSync(target).size);
          }
        }
        if (blockedUrls.length)
          r.evidence.blockedRedirect = blockedUrls[blockedUrls.length - 1];
        if (downloadName && e.steps.some((s) => "download" in s))
          r.evidence.download = downloadName;
        if (e.marksDeleted && r.verified !== false)
          deleted[e.marksDeleted as "dt" | "de"] = true;
        r.ok = true;
        page.off("response", onResp);
        console.log(
          `ok${
            r.verified === false
              ? " (CHECK FAILED: " +
                r.checks
                  .filter((c) => !c.pass)
                  .map((c) => c.check)
                  .join("; ") +
                ")"
              : ""
          }${apiErrors.length ? " api:" + apiErrors.join(",") : ""}`
        );
      } catch (err) {
        if (err instanceof RetryEntry) {
          retried.add(e.id);
          if (transient && page) await page.context().close();
          console.log("signed out by API — retrying");
          i--;
          continue;
        }
        r.error = redact(String(err).split("\n")[0].slice(0, 220));
        if (page) {
          r.finalUrl = redact(page.url().replace(BASE_URL, ""));
          try {
            const dir = path.join(SHOTS, e.pb);
            mkdirSync(dir, { recursive: true });
            const f = fileName(e, "-FAILED");
            await page.screenshot({
              path: path.join(dir, f),
              mask: maskFor(page),
            });
            r.evidence.failureShot = path.posix.join(e.pb, f);
          } catch {
            /* ignore */
          }
        }
        console.log(`FAILED ${r.error}`);
      }
      if (transient && page) await page.context().close();
      results.push(r);
    }
  } finally {
    for (const w of ["dt", "de"] as const) {
      if (created[w] && !deleted[w]) cleanup[w] = await deleteViaApi(w);
      else cleanup[w] = deleted[w] ? "deleted via UI (PB20)" : "never created";
    }
    for (const { ctx } of sessions.values()) await ctx.close().catch(() => {});
    await browser.close();
  }
  mkdirSync(OUT, { recursive: true });
  const target = path.join(OUT, "capture-results.json");
  if (ONLY && existsSync(target)) {
    // Partial run: keep earlier results for entries not re-run, in manifest order.
    const prev: Result[] = JSON.parse(readFileSync(target, "utf8")).results;
    const fresh = new Map(results.map((r) => [r.id, r]));
    const order = manifest.captures.map((c: Entry) => c.id);
    const merged = order
      .map((id: string) => fresh.get(id) ?? prev.find((p) => p.id === id))
      .filter(Boolean) as Result[];
    results.splice(0, results.length, ...merged);
  }
  writeFileSync(
    target,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        apiConcurrencyCap: API_CONCURRENCY,
        runId: RUN_ID,
        disposableAccounts: {
          talent: vars.DT_EMAIL,
          employer: vars.DE_EMAIL,
          cleanup,
        },
        results,
      },
      null,
      2
    )
  );
  const shots = results.reduce((n, r) => n + r.files.length, 0);
  console.log(
    `\n${results.length} entries, ${results.filter((r) => r.ok).length} ok, ${shots} screenshots; cleanup: ${JSON.stringify(cleanup)}`
  );
};

main().catch((e) => {
  console.error(redact(String(e)));
  process.exit(1);
});
