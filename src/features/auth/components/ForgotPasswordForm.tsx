import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/auth.schemas";
import { forgotPassword } from "@/features/auth/auth.service";
import { TextField } from "@/components/shared/TextField";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

export const ForgotPasswordForm = () => {
  const { t } = useTranslation("auth");
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const submitError = useSubmitError();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;
  // Field errors on screen re-validate in the new language after a switch.
  useRevalidateOnLocaleChange(form);

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    submitError.clear();
    try {
      await forgotPassword(values.email);
      setSentEmail(values.email);
      setIsSent(true);
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
    }
  };

  if (isSent) {
    return (
      <div className="rounded-12 border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
        {t("forgotPassword.successDesc", { email: sentEmail })}
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        error={errors.email?.message}
        id="email"
        label={t("forgotPassword.emailLabel")}
        placeholder={t("forgotPassword.emailPlaceholder")}
        autoComplete="email"
        registration={register("email")}
        type="email"
      />

      {submitError.message && (
        <p className="text-sm text-red-600" role="alert">
          {submitError.message}
        </p>
      )}

      <Button
        className="w-full rounded-12"
        disabled={isSubmitting}
        size="lg"
        type="submit"
        isLoading={isSubmitting}
      >
        {isSubmitting
          ? t("forgotPassword.submitting")
          : t("forgotPassword.submit")}
      </Button>
    </form>
  );
};
