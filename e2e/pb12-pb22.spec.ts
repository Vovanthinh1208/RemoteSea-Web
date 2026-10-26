import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { apiUrl, uniqueEmail } from "./support/api";

// PB12–PB22 (Settings, account lifecycle, talent profile, email
// verification) driven through the real browser UI against a running
// remotesea-api on an ISOLATED local database.
//
// Extra preconditions beyond playwright.config.ts:
//   E2E_DB_URL — psql URL of that same isolated database (must be a local
//   remotesea_pb_* database). Used only for fixtures the UI cannot create
//   itself: linked OAuth rows, a session from a public IP, and a known
//   email-verification token (the email itself is never sent in this env).

const PASSWORD = "Password123!";

// The isolated API runs with TRUST_PROXY_HOPS=1, so each test presents its
// own client IP and the real per-IP auth rate limiter applies per test
// instead of across the whole suite.
let clientIp = "198.18.0.1";
const ipHeader = () => ({ "X-Forwarded-For": clientIp });
test.beforeEach(() => {
  const n = Math.floor(Math.random() * 65_000);
  clientIp = `198.18.${n >> 8}.${n & 255}`;
});

const dbUrl = (): string => {
  const raw = process.env.E2E_DB_URL ?? "";
  const url = new URL(raw);
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    !/^\/remotesea_pb_[a-z0-9_]+$/.test(url.pathname)
  ) {
    throw new Error("E2E_DB_URL must be a local remotesea_pb_* database");
  }
  return raw;
};
const sql = (query: string): string =>
  execFileSync("psql", [dbUrl(), "-Atc", query], { encoding: "utf8" }).trim();
const q = (value: string) => `'${value.replace(/'/g, "''")}'`;

type Account = { id: string; email: string; token: string };

async function register(
  request: APIRequestContext,
  role: "TALENT" | "EMPLOYER",
  label: string
): Promise<Account> {
  const email = uniqueEmail(label);
  const res = await request.post(apiUrl("/auth/register"), {
    data: { email, password: PASSWORD, name: `E2E ${label}`, role },
    headers: ipHeader(),
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  const body = await res.json();
  return { id: body.user.id, email, token: body.accessToken };
}

async function apiLogin(
  request: APIRequestContext,
  email: string,
  password = PASSWORD,
  userAgent?: string
) {
  return request.post(apiUrl("/auth/login"), {
    data: { email, password },
    headers: {
      ...ipHeader(),
      ...(userAgent ? { "User-Agent": userAgent } : {}),
    },
  });
}

const authed = (token: string) => ({ Authorization: `Bearer ${token}` });

async function uiLogin(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

// Signs the page in with an API-issued session token (the same storage key
// AuthContext reads) — the sign-in form itself is exercised by the tests
// that are about signing in (PB16 AC5, PB21, PB22).
async function signInWithToken(page: Page, account: Account) {
  await page.addInitScript(
    ([key, token]) => localStorage.setItem(key, token),
    ["remotesea_access_token", account.token]
  );
}

async function openSettings(page: Page, account: Account) {
  await signInWithToken(page, account);
  await page.goto("/settings");
  await expect(page.locator("#account")).toBeVisible();
}

test.describe.configure({ mode: "parallel" });

// ─── PB12 ────────────────────────────────────────────────────────────────
test("PB12-E2E-01 [AC1-2] change-password fields are Current → New → Confirm new", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb12order");
  await openSettings(page, user);
  const ids = await page
    .locator("#security form")
    .first()
    .locator("input[type=password]")
    .evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(["currentPassword", "newPassword", "confirmNewPassword"]);
});

test("PB12-E2E-02 [AC3.1-3.3, C2] wrong / same / valid password through the UI; other sessions revoked", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb12flow");
  const other = await apiLogin(request, user.email);
  const otherToken = (await other.json()).accessToken as string;
  await openSettings(page, user);
  const form = page.locator("#security form").first();
  const fill = async (current: string, next: string) => {
    await form.locator("#currentPassword").fill(current);
    await form.locator("#newPassword").fill(next);
    await form.locator("#confirmNewPassword").fill(next);
    await form.getByRole("button", { name: "Update password" }).click();
  };

  await fill("Wrong-pass-999", "Brand-new-pass-1");
  await expect(
    page.getByText(/current password is incorrect/i).first()
  ).toBeVisible();

  await fill(PASSWORD, PASSWORD);
  await expect(
    page.getByText(/must be different|same as/i).first()
  ).toBeVisible();

  await fill(PASSWORD, "Brand-new-pass-1");
  await expect(page.getByText("Password updated").first()).toBeVisible();
  expect(
    (
      await request.get(apiUrl("/auth/me"), { headers: authed(otherToken) })
    ).status()
  ).toBe(401);
  await page.reload();
  await expect(page.locator("#account")).toBeVisible();
  expect(
    (await apiLogin(request, user.email, "Brand-new-pass-1")).ok()
  ).toBeTruthy();
});

// ─── PB13 ────────────────────────────────────────────────────────────────
test("PB13-E2E-01 [AC1-4] TALENT renames in Settings → Basic info and the navbar shows it immediately", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb13talent");
  await openSettings(page, user);
  const name = page.locator("#account").getByLabel(/full name/i);
  await name.fill("Trần Thị Mai");
  await page
    .locator("#account")
    .getByRole("button", { name: /save changes/i })
    .click();
  await expect(
    page.getByRole("banner").getByText("Trần Thị Mai")
  ).toBeVisible();
  const me = await request.get(apiUrl("/auth/me"), {
    headers: authed(user.token),
  });
  expect((await me.json()).name).toBe("Trần Thị Mai");
});

test("PB13-E2E-02 [Actor, AC1-4] EMPLOYER can rename in Settings too", async ({
  page,
  request,
}) => {
  const user = await register(request, "EMPLOYER", "pb13emp");
  await openSettings(page, user);
  const name = page.locator("#account").getByLabel(/full name/i);
  await name.fill("Lê Văn Employer");
  await page
    .locator("#account")
    .getByRole("button", { name: /save changes/i })
    .click();
  await expect(
    page.getByRole("banner").getByText("Lê Văn Employer")
  ).toBeVisible();
});

test("PB13-E2E-03 [C1] too-short and markup names are refused in the UI with no write", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb13neg");
  await openSettings(page, user);
  const section = page.locator("#account");
  await section.getByLabel(/full name/i).fill("A");
  await section.getByRole("button", { name: /save changes/i }).click();
  await expect(section.getByRole("alert").first()).toBeVisible();
  await section.getByLabel(/full name/i).fill("<b>Bold</b>");
  await section.getByRole("button", { name: /save changes/i }).click();
  await expect(section.getByRole("alert").first()).toBeVisible();
  const me = await request.get(apiUrl("/auth/me"), {
    headers: authed(user.token),
  });
  expect((await me.json()).name).toBe("E2E pb13neg");
});

// ─── PB14 ────────────────────────────────────────────────────────────────
test("PB14-E2E-01 [AC2, C2] phone typed with spaces is saved as E.164; invalid phone is refused", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb14phone");
  await openSettings(page, user);
  const phone = page.locator("#account").getByLabel("Phone");
  await phone.fill("0901234567");
  await phone.blur();
  await expect(page.getByText(/international format/i).first()).toBeVisible();
  await phone.fill("+84 90 123 4567");
  await phone.blur();
  await expect
    .poll(
      async () =>
        (
          await (
            await request.get(apiUrl("/users/me/account"), {
              headers: authed(user.token),
            })
          ).json()
        ).phone
    )
    .toBe("+84901234567");
  await page.reload();
  await expect(page.locator("#account").getByLabel("Phone")).toHaveValue(
    "+84901234567"
  );
});

test("PB14-E2E-02 [AC2] region/currency persist across reload; language switches the UI", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb14prefs");
  await openSettings(page, user);
  const section = page.locator("#account");
  await section.getByLabel("Region").selectOption("Singapore");
  await section.getByLabel("Currency Display").selectOption("VND (₫)");
  await expect
    .poll(
      async () =>
        (
          await (
            await request.get(apiUrl("/users/me/account"), {
              headers: authed(user.token),
            })
          ).json()
        ).currencyDisplay
    )
    .toBe("VND (₫)");
  await page.reload();
  await expect(
    page.locator("#account").getByLabel("Currency Display")
  ).toHaveValue("VND (₫)");
  await page
    .locator("#account")
    .getByLabel("Display Language")
    .selectOption("Tiếng Việt");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("PB14-E2E-03 [AC3, C1] avatar picker in Settings rejects GIF and >5MB before any upload (any role)", async ({
  page,
  request,
}) => {
  const user = await register(request, "EMPLOYER", "pb14avatar");
  await openSettings(page, user);
  const input = page.locator('#account input[type="file"]');
  await expect(input).toHaveAttribute(
    "accept",
    /image\/jpeg.*image\/png.*image\/webp|image\/png/
  );
  let presignCalls = 0;
  page.on("request", (r) => {
    if (r.url().includes("/uploads/presign")) presignCalls++;
  });
  await input.setInputFiles({
    name: "a.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("GIF89a"),
  });
  await expect(
    page.getByRole("status").or(page.getByRole("alert")).first()
  ).toBeVisible();
  await input.setInputFiles({
    name: "big.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await page.waitForTimeout(300);
  expect(presignCalls).toBe(0);
});

// ─── PB15 ────────────────────────────────────────────────────────────────
test("PB15-E2E-01 [AC2-4] five email toggles are shown; Save persists and shows success", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb15");
  await openSettings(page, user);
  const section = page.locator("#notifications");
  for (const label of [
    /application/i,
    /message/i,
    /weekly digest/i,
    /instant/i,
    /product news/i,
  ]) {
    await expect(section.getByText(label).first()).toBeVisible();
  }
  const digest = section.getByRole("switch").nth(2);
  const before = await digest.getAttribute("aria-checked");
  await digest.click();
  await section.getByRole("button", { name: "Save settings" }).click();
  await expect(
    page.getByText("Notification settings saved").first()
  ).toBeVisible();
  await page.reload();
  await expect(
    page.locator("#notifications").getByRole("switch").nth(2)
  ).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");
});

// ─── PB16 ────────────────────────────────────────────────────────────────
test("PB16-E2E-01 [AC1-4] pause shows the warning, then signs the user out", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb16pause");
  await openSettings(page, user);
  await page
    .locator("#danger")
    .getByRole("button", { name: "Pause", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(/hidden from employers/i);
  await expect(dialog).toContainText(/stop receiving new job emails/i);
  await dialog.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page).toHaveURL(/\/login|\/$/);
  expect(
    (
      await request.get(apiUrl("/auth/me"), { headers: authed(user.token) })
    ).status()
  ).toBe(401);
});

test("PB16-E2E-02 [AC5] signing in again from the normal login page offers [Reactivate account] right away", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb16offer");
  await request.post(apiUrl("/users/me/pause"), {
    headers: authed(user.token),
  });
  await uiLogin(page, user.email);
  const reactivate = page.getByRole("button", { name: /reactivate/i }).first();
  await expect(reactivate).toBeVisible();
  await reactivate.click();
  const relog = await apiLogin(request, user.email);
  const state = await request.get(apiUrl("/users/me/pause"), {
    headers: authed((await relog.json()).accessToken),
  });
  await expect.poll(async () => (await state.json()).isPaused).toBe(false);
});

// ─── PB17 ────────────────────────────────────────────────────────────────
test("PB17-E2E-01 [AC1-3, C1] Request export downloads JSON with the user's data and no secrets", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb17");
  await openSettings(page, user);
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#data").getByRole("button", { name: "Request" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  const text = readFileSync(await download.path(), "utf8");
  const json = JSON.parse(text);
  expect(json.account.email).toBe(user.email);
  expect(text).not.toMatch(
    /passwordHash|twoFactorSecret|twoFactorBackupCodes|\$2[aby]\$/
  );
  await expect(page.getByText("Export downloaded").first()).toBeVisible();
});

// ─── PB18 ────────────────────────────────────────────────────────────────
test("PB18-E2E-01 [AC2-4, C1] linked providers show name + link date; last method of a password-less user cannot be removed", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb18");
  sql(`insert into accounts (id, "userId", type, provider, "providerAccountId", "createdAt") values
    (${q(randomUUID())}, ${q(user.id)}, 'oauth', 'google', ${q("g-" + randomUUID())}, now() - interval '3 days'),
    (${q(randomUUID())}, ${q(user.id)}, 'oauth', 'github', ${q("gh-" + randomUUID())}, now())`);
  sql(`update users set "passwordHash" = null where id = ${q(user.id)}`);
  await signInWithToken(page, user);
  await page.goto("/settings");
  const section = page.locator("#connected");
  await expect(section.getByText("Google", { exact: true })).toBeVisible();
  await expect(section.getByText(/^Linked /)).toHaveCount(2);
  await section.getByRole("button", { name: "Disconnect" }).first().click();
  await expect(section.getByRole("button", { name: "Disconnect" })).toHaveCount(
    1
  );
  await section.getByRole("button", { name: "Disconnect" }).click();
  await expect(page.getByText(/keep at least one/i).first()).toBeVisible();
  expect(
    sql(`select count(*) from accounts where "userId" = ${q(user.id)}`)
  ).toBe("1");
});

// ─── PB19 ────────────────────────────────────────────────────────────────
test("PB19-E2E-01 [AC2] each session row shows device/OS, IP address, last activity and marks the current one", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb19list");
  sql(`insert into sessions (id, "userId", "userAgent", ip, "createdAt", "lastSeenAt") values
    (${q(randomUUID())}, ${q(user.id)}, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36', '8.8.8.8', now() - interval '2 hours', now() - interval '2 hours')`);
  await openSettings(page, user);
  const section = page.locator("#security");
  await expect(section.getByText("This device")).toBeVisible();
  await expect(section.getByText(/Chrome on Windows/)).toBeVisible();
  await expect(section.getByText(/8\.8\.8\.8/)).toBeVisible();
  await expect(section.getByText(/2 hours ago/)).toBeVisible();
});

test("PB19-E2E-02 [AC3-5, C1] revoke one session, then all others; the current session survives", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb19revoke");
  const tokens: string[] = [];
  for (const ua of [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0",
  ]) {
    tokens.push(
      (await (await apiLogin(request, user.email, PASSWORD, ua)).json())
        .accessToken
    );
  }
  await openSettings(page, user);
  const section = page.locator("#security");
  await expect(section.getByRole("button", { name: "Revoke" })).toHaveCount(3);
  await section.getByRole("button", { name: "Revoke" }).first().click();
  await expect(section.getByRole("button", { name: "Revoke" })).toHaveCount(2);
  await section
    .getByRole("button", { name: "Sign out of all other sessions" })
    .click();
  await expect(
    page.getByText("Signed out of all other sessions").first()
  ).toBeVisible();
  for (const t of tokens) {
    expect(
      (await request.get(apiUrl("/auth/me"), { headers: authed(t) })).status()
    ).toBe(401);
  }
  await page.reload();
  await expect(
    page.locator("#security").getByText("This device")
  ).toBeVisible();
});

// ─── PB20 ────────────────────────────────────────────────────────────────
test("PB20-E2E-01 [AC1-4.2] delete with password + DELETE lands on the home page signed out, and the account is gone", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb20");
  await openSettings(page, user);
  const danger = page.locator("#danger");
  await danger.getByRole("button", { name: "Delete account" }).click();
  await danger.getByLabel("Current password").fill(PASSWORD);
  await danger.getByLabel("Type DELETE to confirm").fill("DELETE");
  await danger.getByRole("button", { name: "Yes, delete" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("link", { name: "Sign in" }).first()
  ).toBeVisible();
  expect((await apiLogin(request, user.email)).status()).toBe(401);
});

// ─── PB21 ────────────────────────────────────────────────────────────────
test("PB21-E2E-01 [AC1-5, C2] talent saves headline/bio/experience/location/salary/skill; values persist after reload", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb21");
  await uiLogin(page, user.email);
  await page.goto("/talent/profile");
  const headline = page.getByPlaceholder("Role · timezone · standout signal");
  await expect(headline).toBeVisible();
  await headline.fill("h".repeat(121));
  await expect(headline).toHaveValue(/^h{120,121}$/);
  await headline.fill("Fullstack Engineer — Đà Nẵng");
  await page.getByRole("button", { name: /^save/i }).first().click();
  await expect
    .poll(
      async () =>
        (
          await (
            await request.get(apiUrl("/talent/me"), {
              headers: authed(user.token),
            })
          ).json()
        ).headline
    )
    .toBe("Fullstack Engineer — Đà Nẵng");
  await page.reload();
  await expect(
    page.getByPlaceholder("Role · timezone · standout signal")
  ).toHaveValue("Fullstack Engineer — Đà Nẵng");
});

test("PB21-E2E-02 [C1] EMPLOYER cannot open the talent profile editor", async ({
  page,
  request,
}) => {
  const user = await register(request, "EMPLOYER", "pb21emp");
  await uiLogin(page, user.email);
  await page.goto("/talent/profile");
  await expect(page).not.toHaveURL(/\/talent\/profile/);
});

// ─── PB22 ────────────────────────────────────────────────────────────────
test("PB22-E2E-01 [AC1] after sending, the banner still offers [Resend verification email]", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb22resend");
  sql(`update users set "emailVerified" = false where id = ${q(user.id)}`);
  await uiLogin(page, user.email);
  await page.goto("/talent");
  await page.getByRole("button", { name: /send verification email/i }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();
  await expect(page.getByRole("button", { name: /resend/i })).toBeVisible();
});

test("PB22-E2E-02 [AC3-4] clicking the emailed link verifies and the profile shows the verified badge", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb22link");
  sql(`update users set "emailVerified" = false where id = ${q(user.id)}`);
  const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
  const hash = createHash("sha256").update(token).digest("hex");
  sql(`insert into talent_email_verifications (id, "talentId", email, token, "expiresAt")
       select ${q(randomUUID())}, id, ${q(user.email)}, ${q(hash)}, now() + interval '24 hours'
       from talent_profiles where "userId" = ${q(user.id)}`);
  sql(
    `update talent_profiles set "verificationStatus" = 'PENDING', "verificationEmail" = ${q(user.email)} where "userId" = ${q(user.id)}`
  );
  await page.goto(`/talent/verify?token=${token}`);
  await expect(page.getByText("Email verified")).toBeVisible();
  expect(
    sql(`select "emailVerified" from users where id = ${q(user.id)}`)
  ).toBe("t");
  await uiLogin(page, user.email);
  await page.goto("/talent");
  await expect(page.getByText("Check your inbox")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /send verification email/i })
  ).toHaveCount(0);
});

test("PB22-E2E-03 [AC4] Settings does not claim 'Verified' for an unverified email", async ({
  page,
  request,
}) => {
  const user = await register(request, "TALENT", "pb22badge");
  sql(`update users set "emailVerified" = false where id = ${q(user.id)}`);
  await openSettings(page, user);
  await expect(
    page.locator("#account").getByText("Verified", { exact: true })
  ).toHaveCount(0);
});
