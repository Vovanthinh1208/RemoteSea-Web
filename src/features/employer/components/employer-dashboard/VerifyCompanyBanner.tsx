import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import {
  submitVerificationSchema,
  verifyCodeSchema,
  type SubmitVerificationFormValues,
  type VerifyCodeFormValues,
} from "@/features/employer/employer.schemas";
import {
  useSubmitEmployerVerification,
  useVerifyEmployerCode,
} from "@/features/employer/employer.queries";
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
  // "Use a different email" drops back to the email form while a code is
  // still pending server-side; sending a new one supersedes the old code.
  const [changingEmail, setChangingEmail] = useState(false);
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
      setChangingEmail(false);
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
    }
  };

  if (verificationStatus === "PENDING" && !changingEmail) {
    return (
      <EnterCodeCard
        verificationEmail={verificationEmail}
        onChangeEmail={() => setChangingEmail(true)}
      />
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

interface EnterCodeCardProps {
  verificationEmail: string | null;
  onChangeEmail: () => void;
}

// PB32 AC4: after "Send verification code", the OWNER types the 6-digit
// code from the company inbox here (valid 15 minutes).
const EnterCodeCard = ({
  verificationEmail,
  onChangeEmail,
}: EnterCodeCardProps) => {
  const { t } = useTranslation("employer");
  const submitError = useSubmitError();
  const verifyCode = useVerifyEmployerCode();
  const resend = useSubmitEmployerVerification();
  const [resent, setResent] = useState(false);
  const form = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = form;
  useRevalidateOnLocaleChange(form);

  const onSubmit = async (values: VerifyCodeFormValues) => {
    submitError.clear();
    setResent(false);
    try {
      await verifyCode.mutateAsync(values.code);
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
      reset({ code: "" });
    }
  };

  const onResend = async () => {
    if (!verificationEmail) return;
    submitError.clear();
    try {
      await resend.mutateAsync(verificationEmail);
      setResent(true);
      reset({ code: "" });
    } catch (err) {
      submitError.fail(err);
    }
  };

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
        <p className="mb-3 text-[13px] leading-5 text-neutral-600 [overflow-wrap:anywhere]">
          {t("verifyCompany.sentTo", { email: verificationEmail })}
        </p>
        <form
          className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="min-w-0 flex-1 sm:max-w-[220px]">
            <TextField
              autoComplete="one-time-code"
              error={errors.code?.message}
              id="verification-code"
              label={t("verifyCompany.codeLabel")}
              placeholder={t("verifyCompany.codePlaceholder")}
              registration={register("code")}
            />
          </div>
          <Button
            className="w-full sm:w-auto sm:shrink-0"
            disabled={verifyCode.isPending}
            isLoading={verifyCode.isPending}
            size="sm"
            type="submit"
          >
            {t("verifyCompany.verify")}
          </Button>
        </form>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
          <button
            className="font-medium text-amber-800 underline-offset-2 hover:underline disabled:opacity-50"
            disabled={resend.isPending || !verificationEmail}
            type="button"
            onClick={onResend}
          >
            {t("verifyCompany.resend")}
          </button>
          <button
            className="font-medium text-amber-800 underline-offset-2 hover:underline"
            type="button"
            onClick={onChangeEmail}
          >
            {t("verifyCompany.changeEmail")}
          </button>
        </div>
        {resent && (
          <p className="mt-2 text-[13px] text-neutral-600">
            {t("verifyCompany.resent")}
          </p>
        )}
        {submitError.message && (
          <p className="mt-2 break-words text-[13px] text-red-600" role="alert">
            {submitError.message}
          </p>
        )}
      </div>
    </div>
  );
};
