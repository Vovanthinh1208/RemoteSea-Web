import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

export const ResetPasswordForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setFormError(t("resetPassword.invalidToken"));
      return;
    }
    setFormError(null);
    try {
      await resetPassword({ token, password: values.password });
      toast({
        title: t("resetPassword.successTitle"),
        description: t("resetPassword.successDesc"),
        variant: "success",
      });
      navigate(ROUTES.login, { replace: true });
    } catch (err) {
      setFormError(
        applyFormSubmitError(
          err,
          setError,
          "Something went wrong. Please try again."
        )
      );
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

      {formError && <p className="text-sm text-red-600">{formError}</p>}

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
