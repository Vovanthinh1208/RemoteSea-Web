import { createHmac, randomUUID } from "node:crypto";
import type { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

// Everything in this file talks to the real remotesea-api directly (not
// through the app's own UI) — fast, reliable setup for state the spec
// itself isn't testing (an account existing, a job existing), matching
// this session's own manual verification approach. The actual feature
// under test is always driven through the browser in the spec files.

export const apiUrl = (path: string): string =>
  `${process.env.E2E_API_URL ?? "http://localhost:4000"}${path}`;

// Seed account this suite assumes already exists (prisma/seed.ts's
// ADMIN_EMAIL/SEED_PASSWORD in remotesea-api) — there's no self-service way
// to create an ADMIN account, so checkout-to-job-live.spec.ts (which needs
// to approve a job through the moderation queue) logs in as this account
// rather than creating its own. Override via env if a given environment's
// seed data differs.
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@remotesea.dev";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Password123!";

export interface TestUser {
  id: string;
  email: string;
  accessToken: string;
}

// Unique per test run — two runs against the same (or a shared, un-reset)
// database must never collide on the email unique constraint.
export const uniqueEmail = (label: string): string =>
  `e2e-${label}-${randomUUID().slice(0, 8)}@example.com`;

export const registerAndLogin = async (
  request: APIRequestContext,
  role: "TALENT" | "EMPLOYER",
  label: string
): Promise<TestUser> => {
  const email = uniqueEmail(label);
  const password = "Password123!";

  const registerRes = await request.post(apiUrl("/auth/register"), {
    data: { email, password, name: `E2E ${label}`, role },
  });
  expect(registerRes.ok(), await registerRes.text()).toBeTruthy();
  const { id } = (await registerRes.json()) as { id: string };

  const loginRes = await request.post(apiUrl("/auth/login"), {
    data: { email, password },
  });
  expect(loginRes.ok(), await loginRes.text()).toBeTruthy();
  const { accessToken } = (await loginRes.json()) as { accessToken: string };

  return { id, email, accessToken };
};

export const login = async (
  request: APIRequestContext,
  email: string,
  password: string
): Promise<TestUser> => {
  const loginRes = await request.post(apiUrl("/auth/login"), {
    data: { email, password },
  });
  expect(loginRes.ok(), await loginRes.text()).toBeTruthy();
  const { accessToken } = (await loginRes.json()) as { accessToken: string };
  return { id: "", email, accessToken };
};

const authed = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const createTalentProfile = async (
  request: APIRequestContext,
  token: string
): Promise<void> => {
  const res = await request.put(apiUrl("/talent/me"), {
    headers: authed(token),
    data: {},
  });
  expect(res.ok(), await res.text()).toBeTruthy();
};

export const createEmployerProfile = async (
  request: APIRequestContext,
  token: string,
  companyName: string
): Promise<{ id: string; slug: string }> => {
  const res = await request.post(apiUrl("/employer/profile"), {
    headers: authed(token),
    data: { companyName, hqCountry: "Vietnam" },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return res.json();
};

export const getFirstCategoryId = async (
  request: APIRequestContext
): Promise<string> => {
  const res = await request.get(apiUrl("/categories"));
  expect(res.ok(), await res.text()).toBeTruthy();
  const categories = (await res.json()) as { id: string }[];
  const [first] = categories;
  if (!first) throw new Error("No categories seeded — cannot create a job");
  return first.id;
};

export const createDraftJob = async (
  request: APIRequestContext,
  token: string,
  categoryId: string,
  overrides: Partial<Record<string, unknown>> = {}
): Promise<{ id: string; title: string }> => {
  const res = await request.post(apiUrl("/jobs"), {
    headers: authed(token),
    data: {
      title: "E2E Backend Engineer",
      description:
        "We are looking for an experienced backend engineer to join our remote team. ".repeat(
          3
        ),
      jobType: "FULL_TIME",
      level: "MID",
      salaryMin: 2000,
      salaryMax: 4000,
      planType: "STANDARD",
      categoryIds: [categoryId],
      ...overrides,
    },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return res.json();
};

export const createCheckoutSession = async (
  request: APIRequestContext,
  token: string,
  jobId: string
): Promise<{ url: string }> => {
  const res = await request.post(apiUrl("/billing/checkout"), {
    headers: authed(token),
    data: { jobId },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return res.json();
};

export const applyToJob = async (
  request: APIRequestContext,
  token: string,
  jobId: string
): Promise<{ id: string }> => {
  const res = await request.post(apiUrl("/applications"), {
    headers: authed(token),
    data: { jobId },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return res.json();
};

// Approved via a direct API call (not the moderation-queue UI) when a spec
// just needs *an* ACTIVE job to test something else against — the queue UI
// itself (checklist, decision bar) is what checkout-to-job-live.spec.ts
// exercises in detail.
export const approveJobViaApi = async (
  request: APIRequestContext,
  adminToken: string,
  jobId: string
): Promise<void> => {
  const res = await request.patch(apiUrl(`/admin/jobs/${jobId}`), {
    headers: authed(adminToken),
    data: { action: "approve" },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
};

export const findMyApplicationForJob = async (
  request: APIRequestContext,
  talentToken: string,
  jobId: string
): Promise<{ id: string }> => {
  const res = await request.get(apiUrl("/applications?page=1&limit=20"), {
    headers: authed(talentToken),
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  const { applications } = (await res.json()) as {
    applications: { id: string; job: { id: string } }[];
  };
  const match = applications.find((a) => a.job.id === jobId);
  if (!match) {
    throw new Error(`No application found for job ${jobId}`);
  }
  return match;
};

export const getApplication = async (
  request: APIRequestContext,
  token: string,
  applicationId: string
): Promise<{ status: string }> => {
  const res = await request.get(apiUrl(`/applications/${applicationId}`), {
    headers: authed(token),
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return res.json();
};

export const updateApplicationStatus = async (
  request: APIRequestContext,
  employerToken: string,
  applicationId: string,
  status: string
): Promise<void> => {
  const res = await request.patch(
    apiUrl(`/employer/applications/${applicationId}`),
    { headers: authed(employerToken), data: { status } }
  );
  expect(res.ok(), await res.text()).toBeTruthy();
};

export const deleteOwnAccount = async (
  request: APIRequestContext,
  token: string
): Promise<void> => {
  await request.delete(apiUrl("/users/me"), { headers: authed(token) });
};

// Signs a webhook payload exactly the way Stripe does (see
// remotesea-api's BillingService.handleWebhookEvent, which verifies via
// stripe.webhooks.constructEvent — the same HMAC-SHA256(`${t}.${payload}`)
// scheme, documented at https://stripe.com/docs/webhooks/signatures). No
// need for the `stripe` SDK just to compute this.
export const signStripeWebhook = (payload: string, secret: string): string => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
};

export const requireWebhookSecret = (): string => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET must be set in the environment running Playwright " +
        "— it has to match remotesea-api's own STRIPE_WEBHOOK_SECRET so the " +
        "synthetic checkout.session.completed event this test sends verifies " +
        "as genuine. See playwright.config.ts's top comment."
    );
  }
  return secret;
};

// Simulates Stripe's callback for a completed checkout — see
// playwright.config.ts's top comment for why this test doesn't drive the
// actual Stripe-hosted checkout page.
export const sendCheckoutCompletedWebhook = async (
  request: APIRequestContext,
  params: { jobId: string; userId: string; stripeSessionId: string }
): Promise<void> => {
  const payload = JSON.stringify({
    id: `evt_${randomUUID().replace(/-/g, "")}`,
    type: "checkout.session.completed",
    data: {
      object: {
        id: params.stripeSessionId,
        metadata: { jobId: params.jobId, userId: params.userId },
      },
    },
  });
  const signature = signStripeWebhook(payload, requireWebhookSecret());

  const res = await request.post(apiUrl("/billing/webhook"), {
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
    data: payload,
  });
  expect(res.ok(), await res.text()).toBeTruthy();
};

// Hydrates the browser as already logged in as `user`, skipping the login
// form (not what either spec is testing) — mirrors exactly what
// AuthContext reads on boot (see src/core/token/token-storage.ts).
export const loginBrowserAs = async (
  page: Page,
  user: TestUser
): Promise<void> => {
  await page.addInitScript(
    (token) => window.localStorage.setItem("remotesea_access_token", token),
    user.accessToken
  );
};
