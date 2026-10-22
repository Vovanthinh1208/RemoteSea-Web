/**
 * Shared Playwright helpers for the UI-evidence capture scripts
 * (capture-ui-screenshots.ts, capture-sprint-01-ui.ts). Node >= 22.6 runs
 * this directly (type stripping) — keep to erasable TypeScript syntax.
 */
import type { Browser, BrowserContext, Page } from "@playwright/test";

export const BASE_URL = process.env.CAPTURE_BASE_URL ?? "http://localhost:3001";
export const API_URL = process.env.CAPTURE_API_URL ?? "http://localhost:4000";
export const DESKTOP = { width: 1440, height: 900 };
export const MOBILE = { width: 390, height: 844 };
export const TOKEN_KEY = "remotesea_access_token";

export type StorageState = Awaited<ReturnType<BrowserContext["storageState"]>>;

// Wait for data, not for the network to go quiet: the app polls the unread
// count, so "networkidle" may never come. The skeleton check is what gates.
export const settle = async (page: Page) => {
  await page
    .waitForLoadState("networkidle", { timeout: 6_000 })
    .catch(() => {});
  await page
    .waitForFunction(
      // components/ui/skeleton.tsx's signature — a bare .animate-pulse would
      // also match decorative "live" dots (hero, sticky save bar) forever.
      // …and no button still showing its in-flight spinner (Button isLoading:
      // "Creating account…", "Deleting…") — otherwise a slow API response
      // gets captured as the loading state instead of its result.
      () =>
        !document.querySelector(
          '.animate-pulse.bg-neutral-100, [aria-busy="true"], button .animate-spin'
        ),
      undefined,
      { timeout: 20_000 }
    )
    .catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(400);
};

// The API intermittently answers 401 to a *valid* token when it receives
// many requests at once (observed 2 of 8 parallel requests, every round;
// sequential requests always 200 — see docs/ui-design/issues-and-gaps.md).
// The app treats any 401 as "session expired" and signs the user out, so a
// page that fires a burst of queries (Settings) cannot be captured at all.
// Capping in-flight API requests per context works around it without
// touching app code — the same as a slower network. 0 disables the cap.
export const API_CONCURRENCY = Number(process.env.CAPTURE_API_CONCURRENCY ?? 3);
export const throttleApi = async (ctx: BrowserContext) => {
  if (!API_CONCURRENCY) return;
  let active = 0;
  const queue: Array<() => void> = [];
  await ctx.route(`${API_URL}/**`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.continue();
    if (active >= API_CONCURRENCY)
      await new Promise<void>((r) => queue.push(r));
    active++;
    try {
      const res = await route.fetch();
      await route.fulfill({ response: res });
    } catch {
      await route.abort().catch(() => {});
    } finally {
      active--;
      queue.shift()?.();
    }
  });
};

// Login is limited to 10/min per IP (remotesea-api auth/constants.ts) and all
// captures come from 127.0.0.1 — space logins so a run never trips it.
const loginTimes: number[] = [];
export const loginGate = async (maxPerMinute = 7) => {
  for (;;) {
    const now = Date.now();
    while (loginTimes.length && now - loginTimes[0] > 61_000)
      loginTimes.shift();
    if (loginTimes.length < maxPerMinute) break;
    await new Promise((r) => setTimeout(r, 61_000 - (now - loginTimes[0])));
  }
  loginTimes.push(Date.now());
};

export const newContext = async (
  browser: Browser,
  opts: { mobile?: boolean; storageState?: StorageState; locale?: string } = {}
) => {
  const ctx = await browser.newContext({
    viewport: opts.mobile ? MOBILE : DESKTOP,
    locale: opts.locale ?? "en-US",
    storageState: opts.storageState,
    ...(opts.mobile
      ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
      : {}),
    acceptDownloads: true,
  });
  await throttleApi(ctx);
  return ctx;
};

/** Log in through the real /login form; returns the token (never log it). */
export const loginInPage = async (
  page: Page,
  email: string,
  password: string
) => {
  await loginGate();
  await page.goto(`${BASE_URL}/login`);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator('form button[type="submit"]').click();
};

export const loginViaUi = async (
  browser: Browser,
  email: string,
  password: string,
  locale?: string
) => {
  const ctx = await newContext(browser, { locale });
  const page = await ctx.newPage();
  await loginInPage(page, email, password);
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), {
    timeout: 20_000,
  });
  await settle(page);
  const token = await page.evaluate(
    (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
    TOKEN_KEY
  );
  const storage = await ctx.storageState();
  await ctx.close();
  if (!token) throw new Error("login produced no token");
  return { token, storage };
};

export const clickByName = async (
  page: Page,
  name: RegExp,
  role: "button" | "link" | "tab" | "switch" = "button"
) => {
  const el = page.getByRole(role, { name }).first();
  await el.scrollIntoViewIfNeeded();
  await el.click();
  await settle(page);
};

export const submitEmpty =
  (selector = 'button[type="submit"]') =>
  async (page: Page) => {
    const form = page
      .locator("form")
      .filter({ has: page.locator(selector) })
      .first();
    for (const input of await form
      .locator(
        'input[type="email"], input[type="password"], input[type="text"]:not([readonly])'
      )
      .all()) {
      if (await input.isEditable()) await input.fill("");
    }
    await form.locator(selector).first().click();
    await page.waitForTimeout(500);
  };

export const scrollToId = (id: string) => async (page: Page) => {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  // block:start alone tucks the heading under the 56px sticky navbar.
  await page.evaluate((i) => {
    document.getElementById(i)?.scrollIntoView({ block: "start" });
    window.scrollBy(0, -72);
  }, id);
  await page.waitForTimeout(500);
};

export const openMenu = (name: RegExp) => async (page: Page) => {
  await page.getByRole("button", { name }).first().click();
  await page.waitForTimeout(500);
};

/**
 * Never publish: session IPs (PB19), resume links, 2FA secret / QR / backup
 * codes, and any e-mail address outside the test domains (seed data contains
 * a team member's personal address in pending invitations).
 */
export const maskFor = (page: Page) => [
  page.getByText(/\b\d{1,3}(\.\d{1,3}){3}\b/),
  page.getByText(
    /[\w.+-]+@(?!remotesea\.dev\b|example\.com\b)[\w-]+(\.[\w-]+)+/
  ),
  page.locator('a[href*="resume"], a[href$=".pdf"]'),
  page.locator('#security .font-mono, #security img[src^="data:"]'),
];

// RFC 6238 TOTP (SHA-1, 30 s, 6 digits) — used only for the disposable
// capture account's 2FA; the secret is read from the page and kept in memory.
export const totp = async (base32Secret: string, at = Date.now()) => {
  const { createHmac } = await import("node:crypto");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = base32Secret.replace(/[\s=-]/g, "").toUpperCase();
  let bits = "";
  for (const ch of clean)
    bits += alphabet.indexOf(ch).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 1000 / 30)));
  const h = createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  const n =
    ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
};
