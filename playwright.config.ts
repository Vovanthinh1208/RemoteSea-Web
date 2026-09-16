import { defineConfig, devices } from "@playwright/test";

// E2E coverage for the two "money paths" flagged in the product audit as
// having none: apply -> hire (the core hiring pipeline) and
// checkout -> job-live (the paid-listing pipeline, including the Stripe
// webhook and admin moderation queue). Both specs drive the real running
// app end-to-end (register/login via direct API calls for speed — auth
// itself isn't what's under test — then the actual feature through the
// browser) against a real Postgres database, the same way the rest of this
// session's manual verification worked.
//
// Preconditions this config does NOT set up for you (deliberately — these
// need environment-specific values a committed config file can't safely
// hardcode):
//   1. remotesea-api running against a disposable/test database, with
//      STRIPE_SECRET_KEY set to a Stripe *test-mode* key (sk_test_...).
//   2. remotesea-web running and reachable at E2E_BASE_URL.
//   3. STRIPE_WEBHOOK_SECRET in this process's env, matching the exact
//      value remotesea-api is using — checkout-to-job-live.spec.ts signs a
//      synthetic `checkout.session.completed` event with it to simulate
//      Stripe's callback (driving the real Stripe Checkout hosted page
//      from a headless browser isn't reproducible in CI).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      // channel: "chrome" (the system-installed Google Chrome), not
      // Playwright's bundled Chromium — this host's OS predates what the
      // currently-pinned Playwright release ships a Chromium build for.
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
