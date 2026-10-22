import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import {
  submitVerificationSchema,
  type SubmitVerificationFormValues,
} from "@/features/employer/employer.schemas";
import { useSubmitEmployerVerification } from "@/features/employer/employer.queries";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import type { EmployerVerificationStatus } from "@/types/employer";
import { useTranslation } from "@/i18n/useTranslation";

export interface VerifyCompanyBannerProps {
  verificationStatus: EmployerVerificationStatus;
  verificationEmail: string | null;
}

// Sits alongside EmployerDashboard's "Set up your company profile" banner —
// same amber-card treatment, shown once a profile exists but isVerified is
// still false. Hidden entirely once VERIFIED (the VerifiedInline badge next
// to the company name already covers that state).
export const VerifyCompanyBanner = ({
  verificationStatus,
  verificationEmail,
}: VerifyCompanyBannerProps) => {
  const { t } = useTranslation("employer");
  const submitError = useSubmitError();
  const submitVerification = useSubmitEmployerVerification();
  const form = useForm<SubmitVerificationFormValues>({
    resolver: zodResolver(submitVerificationSchema),
    defaultValues: { email: verificationEmail ?? "" },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  useRevalidateOnLocaleChange(form);

  const onSubmit = async (values: SubmitVerificationFormValues) => {
    submitError.clear();
    try {
      await submitVerification.mutateAsync(values.email);
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
    }
  };

  if (verificationStatus === "PENDING") {
    return (
      <div
        aria-live="polite"
        className="mb-6 flex min-w-0 items-start gap-3 rounded-20 border border-amber-200 bg-amber-50 p-4 sm:gap-4 sm:p-5"
        role="status"
      >
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
          <ShieldCheck aria-hidden="true" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
            {t("verifyCompany.checkInbox")}
          </h3>
          <p className="text-[13px] leading-5 text-neutral-600 [overflow-wrap:anywhere]">
            {t("verifyCompany.sentTo", { email: verificationEmail })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex min-w-0 items-start gap-3 rounded-20 border border-amber-200 bg-amber-50 p-4 sm:gap-4 sm:p-5">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
        <ShieldCheck aria-hidden="true" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
          {t("verifyCompany.title")}
        </h3>
        <p className="mb-3 text-[13px] leading-5 text-neutral-600">
          {verificationStatus === "FAILED"
            ? t("verifyCompany.expired")
            : t("verifyCompany.prompt")}
        </p>
        <form
          className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="min-w-0 flex-1 sm:max-w-sm">
            <TextField
              error={errors.email?.message}
              id="verification-email"
              label={t("verifyCompany.emailLabel")}
              placeholder={t("verifyCompany.emailPlaceholder")}
              autoComplete="email"
              registration={register("email")}
              type="email"
            />
          </div>
          <Button
            className="w-full sm:w-auto sm:shrink-0"
            disabled={submitVerification.isPending}
            isLoading={submitVerification.isPending}
            size="sm"
            type="submit"
          >
            {t("verifyCompany.send")}
          </Button>
        </form>
        {submitError.message && (
          <p className="mt-2 break-words text-[13px] text-red-600" role="alert">
            {submitError.message}
          </p>
        )}
      </div>
    </div>
  );
};
