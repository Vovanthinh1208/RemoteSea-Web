import { useForm } from "react-hook-form";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/auth.schemas";
import { resetPassword } from "@/features/auth/auth.service";
import { TextField } from "@/components/shared/TextField";
import { useToast } from "@/components/ui/toast";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

export const ResetPasswordForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const submitError = useSubmitError();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;
  // Field errors on screen re-validate in the new language after a switch.
  useRevalidateOnLocaleChange(form);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      submitError.failWithKey("auth.resetPassword.invalidToken");
      return;
    }
    submitError.clear();
    try {
      await resetPassword({ token, password: values.password });
      toast({
        title: t("resetPassword.successTitle"),
        description: t("resetPassword.successDesc"),
        variant: "success",
      });
      navigate(ROUTES.login, { replace: true });
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
    }
  };

  if (!token) {
    return (
      <div className="rounded-12 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("resetPassword.invalidToken")}
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        error={errors.password?.message}
        id="password"
        label={t("resetPassword.newPasswordLabel")}
        placeholder={t("resetPassword.newPasswordPlaceholder")}
        autoComplete="new-password"
        registration={register("password")}
        type="password"
      />

      <TextField
        error={errors.confirmPassword?.message}
        id="confirmPassword"
        label={t("resetPassword.confirmPasswordLabel")}
        placeholder={t("resetPassword.confirmPasswordPlaceholder")}
        autoComplete="new-password"
        registration={register("confirmPassword")}
        type="password"
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
          ? t("resetPassword.submitting")
          : t("resetPassword.submit")}
      </Button>
    </form>
  );
};
