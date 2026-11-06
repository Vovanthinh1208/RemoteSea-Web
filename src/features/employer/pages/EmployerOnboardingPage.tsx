import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/core/errors/api-error";
import {
  useCreateEmployerProfile,
  useEmployerProfile,
} from "@/features/employer/employer.queries";
import { StepCompany } from "@/features/post-job/components/StepCompany";
import {
  hqToCountry,
  INITIAL_FORM_STATE,
  validateCompanyProfile,
  type PostJobFormState,
} from "@/features/post-job/post-job.schemas";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSubmitError } from "@/hooks/useSubmitError";
import { useTranslation } from "@/i18n/useTranslation";

const PROFILE_ALREADY_EXISTS_STATUS = 409;

// PB30: creating the company is its own step. The caller becomes its OWNER and
// lands on the dashboard, without having to write a job first.
export const EmployerOnboardingPage = () => {
  const { t } = useTranslation("postjob");
  useDocumentTitle(t("onboarding.docTitle"));
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: profile } = useEmployerProfile();
  const createProfile = useCreateEmployerProfile();
  const submitError = useSubmitError();
  const [form, setForm] = useState<PostJobFormState>(INITIAL_FORM_STATE);
  const [showErrors, setShowErrors] = useState(false);

  // PB30 PRE: only for an account with no company yet.
  if (profile) return <Navigate replace to={ROUTES.employerDashboard} />;

  const errors = showErrors ? validateCompanyProfile(form) : [];

  const handleSubmit = async (): Promise<void> => {
    submitError.clear();
    if (validateCompanyProfile(form).length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    try {
      await createProfile.mutateAsync({
        companyName: form.coName.trim(),
        websiteUrl: form.coWeb.trim(),
        description: form.coAbout.trim(),
        size: form.coSize,
        hqCountry: hqToCountry(form.coHq),
        logoUrl: form.coLogo || undefined,
      });
    } catch (err) {
      if (!(
        err instanceof ApiError && err.status === PROFILE_ALREADY_EXISTS_STATUS
      )) {
        submitError.fail(err, "postjob.onboarding.failed");
        return;
      }
    }
    toast({ variant: "success", title: t("onboarding.done") });
    navigate(ROUTES.employerDashboard);
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-[760px] rounded-20 border border-neutral-200 bg-white p-8">
        <StepCompany
          profileOnly
          form={form}
          set={(k, v) => setForm((prev) => ({ ...prev, [k]: v }))}
        />
        {submitError.message && (
          <p
            className="mt-4 rounded-10 bg-red-50 px-3 py-2 text-[13px] text-red-600"
            role="alert"
          >
            {submitError.message}
          </p>
        )}
        {errors.length > 0 && (
          <ul
            className="mt-4 list-disc space-y-0.5 rounded-10 bg-red-50 py-2.5 pl-7 pr-3 text-[13px] text-red-600"
            role="alert"
          >
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
        <div className="mt-8 flex justify-end border-t border-neutral-100 pt-6">
          <Button
            disabled={createProfile.isPending}
            type="button"
            onClick={() => void handleSubmit()}
          >
            {createProfile.isPending
              ? t("onboarding.submitting")
              : t("onboarding.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};
