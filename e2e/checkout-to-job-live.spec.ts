import { expect, test } from "@playwright/test";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  createCheckoutSession,
  createDraftJob,
  createEmployerProfile,
  getFirstCategoryId,
  login,
  loginBrowserAs,
  registerAndLogin,
  sendCheckoutCompletedWebhook,
} from "./support/api";

// The "checkout -> job-live" money path flagged as untested in the product
// audit: post a job, pay for it, get moderated, go live. Each step uses the
// real API/UI it would in production — the one deliberate substitution is
// Stripe's own hosted checkout page (see playwright.config.ts's top comment
// for why that boundary, not this app's code, is out of scope here).
test("checkout -> job-live: a paid, unverified employer's job is queued for review and goes live once an admin approves it", async ({
  page,
  request,
}) => {
  const employer = await registerAndLogin(
    request,
    "EMPLOYER",
    "checkout-employer"
  );
  await createEmployerProfile(request, employer.accessToken, "E2E Checkout Co");
  const categoryId = await getFirstCategoryId(request);
  const jobTitle = `E2E Checkout Job ${Date.now()}`;
  const job = await createDraftJob(request, employer.accessToken, categoryId, {
    title: jobTitle,
  });

  // Real Stripe test-mode session — proves the actual checkout integration
  // (price, metadata, success/cancel URLs) works, not just this test's own
  // webhook simulation below.
  const checkout = await createCheckoutSession(
    request,
    employer.accessToken,
    job.id
  );
  expect(checkout.url).toContain("stripe.com");

  // Simulates Stripe's delivery of the completed-checkout event — exercises
  // the real webhook route: signature verification, marking the job paid,
  // and (since this employer isn't verified) routing it to PENDING_REVIEW
  // rather than auto-approving.
  await sendCheckoutCompletedWebhook(request, {
    jobId: job.id,
    userId: employer.id,
    stripeSessionId: `cs_test_e2e_${Date.now()}`,
  });

  // An admin reviews the real moderation queue through the real UI —
  // including the reviewer checklist gate, not just a bare API call.
  const admin = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  await loginBrowserAs(page, admin);
  await page.goto("/admin");

  await page.getByRole("button", { name: new RegExp(jobTitle) }).click();

  const checklistItems = page.getByRole("checkbox");
  const checklistCount = await checklistItems.count();
  expect(checklistCount).toBeGreaterThan(0);
  for (let i = 0; i < checklistCount; i++) {
    await checklistItems.nth(i).click();
  }

  // Waits for the actual PATCH response rather than the resolution banner
  // that briefly appears afterward — the queue immediately advances to the
  // next pending item once this one leaves the list (by design, so an
  // admin can keep working the queue), which can make that banner belong
  // to a job that's no longer the one on screen by the time this checks.
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes(`/admin/jobs/${job.id}`) &&
        res.request().method() === "PATCH"
    ),
    page.getByRole("button", { name: "Approve & publish" }).click(),
  ]);
  expect(response.ok()).toBeTruthy();

  // The actual point of "job-live": it's now on the public listings page
  // (this app's auth is a bearer token in localStorage, not a cookie/session
  // — the admin token still being present here doesn't gate this public route).
  await page.goto(`/jobs?q=${encodeURIComponent(jobTitle)}`);
  await expect(page.getByText(jobTitle)).toBeVisible();

  // No employer cleanup here: DELETE /users/me correctly refuses to delete
  // an account with an active job posting (ACTIVE_JOBS_PREVENT_DELETION) —
  // by design, not a gap in this test. This test's job/employer rows are
  // left behind for the environment's own reset between full suite runs,
  // the same way most E2E suites rely on a disposable database rather than
  // fine-grained per-test teardown for every row created.
});
