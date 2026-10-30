import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import {
  submitVerificationSchema,
  type SubmitVerificationFormValues,
} from "@/features/talent/talent.schemas";
import { useSubmitTalentVerification } from "@/features/talent/talent.queries";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import type { TalentVerificationStatus } from "@/types/talent";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";

interface VerifyEmailBannerProps {
  verificationStatus: TalentVerificationStatus;
  verificationEmail: string | null;
}

export const VerifyEmailBanner = ({
  verificationStatus,
  verificationEmail,
}: VerifyEmailBannerProps) => {
  const { t } = useTranslation("talent");
  const submitError = useSubmitError();
  const submitVerification = useSubmitTalentVerification();
  const { user } = useAuth();
  const form = useForm<SubmitVerificationFormValues>({
    resolver: zodResolver(submitVerificationSchema),
    // PB22: only the account's own address can be verified (the API rejects
    // others), so it is prefilled — sending is one click.
    defaultValues: { email: verificationEmail ?? user?.email ?? "" },
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
      <div className="mb-6 flex items-start gap-4 rounded-20 border border-amber-200 bg-amber-50 p-5">
        <ShieldCheck className="mt-0.5 shrink-0 text-amber-600" size={20} />
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
            {t("verifyEmail.checkInbox")}
          </h3>
          <p className="text-[13px] text-neutral-600">
            {t("verifyEmail.sentTo", { email: verificationEmail })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-start gap-4 rounded-20 border border-amber-200 bg-amber-50 p-5">
      <ShieldCheck className="mt-0.5 shrink-0 text-amber-600" size={20} />
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-[14.5px] font-semibold text-neutral-900">
          {t("verifyEmail.title")}
        </h3>
        <p className="mb-3 text-[13px] text-neutral-600">
          {verificationStatus === "FAILED"
            ? t("verifyEmail.expired")
            : t("verifyEmail.prompt")}
        </p>
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-start"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full sm:max-w-xs">
            <TextField
              error={errors.email?.message}
              id="verification-email"
              label={t("verifyEmail.emailLabel")}
              placeholder={t("verifyEmail.emailPlaceholder")}
              autoComplete="email"
              registration={register("email")}
              type="email"
            />
          </div>
          <Button
            className="shrink-0"
            disabled={submitVerification.isPending}
            isLoading={submitVerification.isPending}
            size="sm"
            type="submit"
          >
            {t("verifyEmail.send")}
          </Button>
        </form>
        {submitError.message && (
          <p className="mt-2 text-[13px] text-red-600" role="alert">
            {submitError.message}
          </p>
        )}
      </div>
    </div>
  );
};
