import { useState } from "react";
import { ChevronRight, Check, Shield, Tag, Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/core/errors/api-error";
import { reportError } from "@/services/monitoring";
import { useCategories, useSkills } from "@/features/taxonomy/taxonomy.queries";
import {
  useCreateEmployerProfile,
  useEmployerProfile,
} from "@/features/employer/employer.queries";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateJob, useUpdateJob } from "@/features/jobs/jobs.queries";
import { useCreateCheckoutSession } from "@/features/billing/billing.queries";
import { StepCompany } from "@/features/post-job/components/StepCompany";
import { StepRole } from "@/features/post-job/components/StepRole";
import { StepPlan } from "@/features/post-job/components/StepPlan";
import { StepReview } from "@/features/post-job/components/StepReview";
import { PreviewCard } from "@/features/post-job/components/PreviewCard";
import { PostJobDraftSaved } from "@/features/post-job/components/PostJobDraftSaved";
import {
  hqToCountry,
  INITIAL_FORM_STATE,
  JOB_TYPE_TO_ENUM,
  MIN_JOB_DESCRIPTION_LENGTH,
  prefillCompanyStep,
  SENIORITY_TO_LEVEL,
  TIERS,
  validateStep,
  type PostJobFormState,
} from "@/features/post-job/post-job.schemas";
import {
  clearPostJobDraft,
  loadPostJobDraft,
  usePostJobDraftPersistence,
} from "@/features/post-job/use-post-job-draft";
import type { UpdateJobRequestDto } from "@/features/jobs/jobs.dto";
import { formatUsd } from "@/utils/format";
import { useTranslation } from "@/i18n/useTranslation";
import { getErrorMessage } from "@/core/errors/localize";
import { useSubmitError } from "@/hooks/useSubmitError";
import { translate } from "@/i18n/runtime";

const STEPS = [
  { id: 1, key: "step.company" },
  { id: 2, key: "step.role" },
  { id: 3, key: "step.plan" },
  { id: 4, key: "step.review" },
];

const MAX_SKILL_IDS = 15;
const MAX_BENEFITS = 10;
const PROFILE_ALREADY_EXISTS_STATUS = 409;

export const PostJobWizard = () => {
  const { t } = useTranslation("postjob");
  const { toast } = useToast();
  // Restore any saved draft synchronously so the first render already shows it.
  const [draft] = useState(loadPostJobDraft);
  const [step, setStep] = useState(draft?.step ?? 1);
  const [form, setForm] = useState<PostJobFormState>(
    draft?.form ?? INITIAL_FORM_STATE
  );
  const [publishedJobId, setPublishedJobId] = useState<string | null>(null);
  // Set once POST /jobs succeeds, so a retry after a failed checkout updates
  // that DRAFT instead of creating a duplicate one.
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  // Holds the failure reason (error or i18n key), not translated text, so the
  // message re-translates if the language changes while it is on screen.
  const submitError = useSubmitError();
  // Separate from the final-publish failure — a step can have several invalid
  // fields at once, and showing only the first meant fixing one just revealed
  // the next in a whack-a-mole loop. Only a flag is stored; the messages are
  // derived from the live form + active locale at render time.
  const [showStepErrors, setShowStepErrors] = useState(false);

  usePostJobDraftPersistence(form, step, !!publishedJobId, !!draft);

  const { data: categories } = useCategories();
  const { data: allSkills, isError: skillsErrored } = useSkills();
  const createProfileMutation = useCreateEmployerProfile();
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const createCheckoutMutation = useCreateCheckoutSession();

  // PB41: start from the existing company profile when there is one (see
  // prefillCompanyStep). Applied once, during render, when it arrives.
  const { user } = useAuth();
  const { data: existingProfile } = useEmployerProfile();
  const [companyPrefilled, setCompanyPrefilled] = useState(false);
  if (!companyPrefilled && existingProfile) {
    setCompanyPrefilled(true);
    setForm((prev) => prefillCompanyStep(prev, existingProfile, user));
  }

  const [categoryDefaulted, setCategoryDefaulted] = useState(false);
  if (!categoryDefaulted && categories && categories.length > 0) {
    setCategoryDefaulted(true);
    if (!form.jobCategoryId) {
      setForm((prev) => ({
        ...prev,
        jobCategoryId: categories[0].id,
      }));
    }
  }

  const set = (k: keyof PostJobFormState, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const failWith = (key: string, params?: Record<string, string | number>) => {
    submitError.failWithKey(key, params);
    setPublishing(false);
    toast({
      variant: "error",
      title: t("wizard.failedTitle"),
      description: translate(key, params),
    });
  };
  const failWithError = (err: unknown, fallbackKey: string) => {
    submitError.fail(err, fallbackKey);
    setPublishing(false);
    toast({
      variant: "error",
      title: t("wizard.failedTitle"),
      description: getErrorMessage(err, translate(fallbackKey)),
    });
  };

  const goToStep = (nextStep: number) => {
    // Only gate moving *forward* — going back to fix an earlier step should
    // always be allowed even if the current step is currently invalid.
    if (nextStep > step) {
      if (validateStep(step, form).length > 0) {
        setShowStepErrors(true);
        return;
      }
    }
    setShowStepErrors(false);
    submitError.clear();
    setStep(nextStep);
  };

  const handlePublish = async () => {
    setPublishing(true);
    submitError.clear();
    setShowStepErrors(false);

    if (form.jobDesc.trim().length < MIN_JOB_DESCRIPTION_LENGTH) {
      failWith("postjob.wizard.descMin", { min: MIN_JOB_DESCRIPTION_LENGTH });
      return;
    }
    if (!form.jobCategoryId) {
      failWith("postjob.wizard.noCategories");
      return;
    }
    if (form.jobSkills.length > 0 && !allSkills) {
      failWith(
        skillsErrored
          ? "postjob.wizard.skillsFailed"
          : "postjob.wizard.skillsLoading"
      );
      return;
    }

    try {
      await createProfileMutation.mutateAsync({
        companyName: form.coName,
        websiteUrl: form.coWeb || undefined,
        description: form.coAbout || undefined,
        size: form.coSize || undefined,
        hqCountry: hqToCountry(form.coHq),
        logoUrl: form.coLogo || undefined,
      });
    } catch (err) {
      if (!(
        err instanceof ApiError && err.status === PROFILE_ALREADY_EXISTS_STATUS
      )) {
        reportError(err);
        failWith("postjob.wizard.profileFailed");
        return;
      }
    }

    const skillIndex = Object.fromEntries(
      (allSkills ?? []).map((s) => [s.name.toLowerCase(), s.id])
    );
    const skillIds = form.jobSkills
      .map((s) => skillIndex[s.toLowerCase()])
      .filter((id): id is string => Boolean(id))
      .slice(0, MAX_SKILL_IDS);

    const editableFields = {
      title: form.jobTitle,
      description: form.jobDesc,
      jobType: JOB_TYPE_TO_ENUM[form.jobType],
      level: SENIORITY_TO_LEVEL[form.jobSeniority],
      salaryMin: form.salMin,
      salaryMax: form.salMax,
      timezone: form.jobTz || undefined,
      country: hqToCountry(form.coHq),
      benefits: form.benefits.slice(0, MAX_BENEFITS),
      planType:
        TIERS.find((tier) => tier.id === form.tier)?.planType ?? "STANDARD",
    } satisfies UpdateJobRequestDto;

    let jobId: string;
    try {
      if (createdJobId) {
        // Retry after checkout failed: carry any edits onto the existing
        // DRAFT (category and skills aren't editable, PB42 RC2).
        await updateJobMutation.mutateAsync({
          id: createdJobId,
          payload: editableFields,
        });
        jobId = createdJobId;
      } else {
        const job = await createJobMutation.mutateAsync({
          ...editableFields,
          categoryIds: [form.jobCategoryId],
          skillIds,
        });
        jobId = job.id;
        setCreatedJobId(job.id);
      }
    } catch (err) {
      reportError(err);
      // A blocked action (e.g. a suspended company) has an actionable,
      // specific reason from the backend — showing it beats a generic
      // "check the required fields" message that doesn't apply here at all.
      failWithError(err, "postjob.wizard.createFailed");
      return;
    }

    try {
      const { url } = await createCheckoutMutation.mutateAsync(jobId);
      if (url) {
        // The job now lives on the server; a cancelled payment returns to the
        // dashboard, so the local copy must not resurrect it as a new job.
        clearPostJobDraft();
        window.location.href = url;
        return;
      }
    } catch (err) {
      reportError(err);
      // The job itself was already created above — only checkout failed, so
      // this must not fall through to the "published" step below as if
      // nothing went wrong. A payment outage (5xx / network) gets the
      // "your job was saved, try again" copy rather than a generic server
      // error; a specific 4xx reason (rate limit, not payable) still shows.
      if (!(err instanceof ApiError) || err.status === 0 || err.status >= 500) {
        failWith("postjob.wizard.checkoutFailed");
      } else {
        failWithError(err, "postjob.wizard.checkoutFailed");
      }
      return;
    }

    setPublishing(false);
    setPublishedJobId(jobId);
  };

  if (publishedJobId)
    return <PostJobDraftSaved form={form} jobId={publishedJobId} />;

  const selectedTier = TIERS.find((tier) => tier.id === form.tier) ?? TIERS[0];
  const stepErrors = showStepErrors ? validateStep(step, form) : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar — no RemoteSEA wordmark here: the global Navbar directly
          above this page already shows the logo and a link home, so
          repeating it in this second bar was pure duplication, not a
          second piece of information. */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="sr-only">{t("wizard.heading")}</h1>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div className="flex items-center gap-1" key={s.id}>
                <button
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-medium transition-all focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed",
                    step === s.id
                      ? "bg-brand-600 text-white"
                      : step > s.id
                        ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                        : "bg-neutral-100 text-neutral-400"
                  )}
                  disabled={s.id >= step}
                  type="button"
                  onClick={() => goToStep(s.id)}
                >
                  {step > s.id ? <Check size={11} /> : s.id}
                </button>
                <span
                  className={cn(
                    "hidden text-[12px] font-medium sm:inline",
                    step === s.id ? "text-neutral-900" : "text-neutral-400"
                  )}
                >
                  {t(s.key)}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="text-neutral-300" size={14} />
                )}
              </div>
            ))}
          </div>
          <div className="text-[12px] text-neutral-400">
            {t("wizard.stepOf", { step, total: STEPS.length })}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-[1200px] gap-8 px-6 py-10 lg:grid lg:grid-cols-[1fr_320px]">
        <div className="rounded-20 border border-neutral-200 bg-white p-8">
          {step === 1 && (
            <StepCompany
              companyExists={Boolean(existingProfile)}
              form={form}
              set={set}
            />
          )}
          {step === 2 && <StepRole form={form} set={set} />}
          {step === 3 && <StepPlan form={form} set={set} />}
          {step === 4 && <StepReview form={form} />}

          {submitError.message && (
            <p
              className="mt-4 rounded-10 bg-red-50 px-3 py-2 text-[13px] text-red-600"
              role="alert"
            >
              {submitError.message}
            </p>
          )}
          {stepErrors.length > 0 && (
            <div
              className="mt-4 rounded-10 bg-red-50 px-3 py-2.5 text-[13px] text-red-600"
              role="alert"
            >
              {stepErrors.length === 1 ? (
                stepErrors[0]
              ) : (
                <ul className="list-disc space-y-0.5 pl-4">
                  {stepErrors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-neutral-100 pt-6">
            {step > 1 ? (
              <button
                className="rounded-12 border border-neutral-200 px-5 py-2.5 text-[13.5px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={() => goToStep(step - 1)}
              >
                {t("wizard.back")}
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button
                className="inline-flex items-center gap-2 rounded-12 bg-brand-600 px-6 py-2.5 text-[13.5px] font-medium text-white hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
                onClick={() => goToStep(step + 1)}
              >
                {t("wizard.continue")} <ChevronRight size={14} />
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-2 rounded-12 bg-brand-600 px-6 py-2.5 text-[13.5px] font-medium text-white hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
                disabled={publishing}
                type="button"
                onClick={handlePublish}
              >
                <Zap size={14} />{" "}
                {publishing ? t("wizard.processing") : t("wizard.pay")}
              </button>
            )}
          </div>
        </div>

        {/* Sticky aside */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <Tag className="mr-1 inline" size={10} />
                {t("wizard.preview")}
              </p>
              <PreviewCard form={form} />
            </div>

            <div className="rounded-16 border border-neutral-100 bg-white p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {t("wizard.orderSummary")}
              </p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-neutral-600">
                  <span>{t(`tier.${selectedTier.id}.name`)}</span>
                  <span>{formatUsd(selectedTier.price)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-2 font-semibold text-neutral-900">
                  <span>{t("wizard.total")}</span>
                  <span>{formatUsd(selectedTier.price)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-16 border border-neutral-100 bg-white p-3 text-[12px] text-neutral-400">
              <Shield className="flex-shrink-0 text-brand-500" size={13} />
              {t("wizard.secured")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
