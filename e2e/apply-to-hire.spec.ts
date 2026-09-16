import { expect, test } from "@playwright/test";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  approveJobViaApi,
  createCheckoutSession,
  createDraftJob,
  createEmployerProfile,
  createTalentProfile,
  deleteOwnAccount,
  findMyApplicationForJob,
  getApplication,
  getFirstCategoryId,
  login,
  loginBrowserAs,
  registerAndLogin,
  sendCheckoutCompletedWebhook,
  updateApplicationStatus,
} from "./support/api";

// The "apply -> hire" money path flagged as untested in the product audit:
// a talent applies, an employer moves them through the hiring pipeline, and
// the talent accepts the resulting offer. Getting the job itself to ACTIVE
// (so there's something to apply to) reuses the exact real
// checkout+webhook+approve pipeline checkout-to-job-live.spec.ts tests in
// detail — here it's just setup, done via API for speed.
test("apply -> hire: a talent's application moves through the real hiring pipeline to an accepted offer", async ({
  browser,
  request,
}) => {
  const employer = await registerAndLogin(request, "EMPLOYER", "hire-employer");
  await createEmployerProfile(request, employer.accessToken, "E2E Hire Co");
  const categoryId = await getFirstCategoryId(request);
  const job = await createDraftJob(request, employer.accessToken, categoryId, {
    title: `E2E Hire Job ${Date.now()}`,
  });
  const checkout = await createCheckoutSession(
    request,
    employer.accessToken,
    job.id
  );
  expect(checkout.url).toContain("stripe.com");
  await sendCheckoutCompletedWebhook(request, {
    jobId: job.id,
    userId: employer.id,
    stripeSessionId: `cs_test_e2e_${Date.now()}`,
  });
  const admin = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  await approveJobViaApi(request, admin.accessToken, job.id);

  const talent = await registerAndLogin(request, "TALENT", "hire-talent");
  await createTalentProfile(request, talent.accessToken);

  // Talent applies through the real UI, not the API — this is the actual
  // start of the flow under test.
  const talentContext = await browser.newContext();
  const talentPage = await talentContext.newPage();
  await loginBrowserAs(talentPage, talent);
  await talentPage.goto(`/jobs/${job.id}`);
  await talentPage.getByRole("button", { name: "Apply now" }).click();
  await talentPage.getByRole("button", { name: "Send application" }).click();
  await expect(talentPage.getByText("Application sent").first()).toBeVisible();

  const application = await findMyApplicationForJob(
    request,
    talent.accessToken,
    job.id
  );

  // Employer moves the applicant through PENDING -> REVIEWING -> SHORTLISTED
  // -> INTERVIEW via the real dashboard UI. Each of these buttons shows a
  // ConfirmAction step with the identical label as its own confirmation.
  const employerContext = await browser.newContext();
  const employerPage = await employerContext.newPage();
  await loginBrowserAs(employerPage, employer);
  await employerPage.goto("/employer-dashboard");

  for (const label of ["Review", "Shortlist", "Interview"] as const) {
    // exact: true matters here — "Shortlist" is otherwise a substring match
    // of the panel's own "Shortlisted" tab-filter pill, which is always on
    // screen and would make the final not-toBeVisible check below false.
    const button = employerPage.getByRole("button", {
      name: label,
      exact: true,
    });
    await button.click();
    // Wait for the actual PATCH to resolve, not just the confirm click's
    // dispatch — the button's own accessible name flips to "Updating…"
    // (ApplicantsPanel's pendingLabel) the instant the request goes out,
    // which would otherwise satisfy a bare not-toBeVisible({name: label})
    // check well before the server has actually applied the transition.
    const [response] = await Promise.all([
      employerPage.waitForResponse(
        (res) =>
          res.url().includes(`/employer/applications/${application.id}`) &&
          res.request().method() === "PATCH"
      ),
      button.click(),
    ]);
    expect(response.ok()).toBeTruthy();
  }

  // GET /applications/:id is talent-only ("own application") — the
  // employer's view of the same data is the dashboard list, not a
  // single-item GET, so verification here always uses the talent's token.
  let current = await getApplication(
    request,
    talent.accessToken,
    application.id
  );
  expect(current.status).toBe("INTERVIEW");

  // INTERVIEW -> OFFERED requires scheduling and confirming an interview
  // first (a separate sub-flow, its own UI) — done via API here since this
  // spec's subject is the hiring pipeline's status progression, not
  // interview scheduling.
  await updateApplicationStatus(
    request,
    employer.accessToken,
    application.id,
    "OFFERED"
  );

  // Talent accepts the offer through the real UI — the actual "hire" this
  // spec is named for.
  await talentPage.goto(`/applications/${application.id}`);
  await talentPage.getByRole("button", { name: "Accept offer" }).click();
  await talentPage.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(
    talentPage.getByText("You accepted this offer. Congratulations!")
  ).toBeVisible();

  current = await getApplication(request, talent.accessToken, application.id);
  expect(current.status).toBe("OFFER_ACCEPTED");

  // No employer cleanup: DELETE /users/me correctly refuses an account with
  // an active job posting (ACTIVE_JOBS_PREVENT_DELETION) — see
  // checkout-to-job-live.spec.ts's own comment on this. The talent has no
  // such restriction (an application isn't a self-delete obstacle).
  await deleteOwnAccount(request, talent.accessToken);
});
