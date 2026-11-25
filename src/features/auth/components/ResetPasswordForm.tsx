import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/auth.schemas";
import { resetPassword, verifyResetToken } from "@/features/auth/auth.service";
import { TextField } from "@/components/shared/TextField";
import { useToast } from "@/components/ui/toast";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";
import { ROUTES } from "@/constants/routes";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { ApiError } from "@/core/errors/api-error";
import { getErrorMessage } from "@/core/errors/localize";
import { Spinner } from "@/components/ui/spinner";

export const ResetPasswordForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [tokenStatus, setTokenStatus] = useState<
    "loading" | "valid" | "invalid"
  >(token ? "loading" : "invalid");
  const [tokenErrorMessage, setTokenErrorMessage] = useState("");
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

  useEffect(() => {
    let active = true;
    if (!token) {
      setTokenStatus("invalid");
      setTokenErrorMessage(t("resetPassword.invalidToken"));
      return;
    }

    setTokenStatus("loading");
    verifyResetToken(token)
      .then(() => {
        if (active) {
          setTokenStatus("valid");
        }
      })
      .catch((err) => {
        if (active) {
          setTokenStatus("invalid");
          setTokenErrorMessage(
            getErrorMessage(
              err,
              t("resetPassword.expiredToken") || t("resetPassword.invalidToken")
            )
          );
        }
      });

    return () => {
      active = false;
    };
  }, [token, t]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setTokenStatus("invalid");
      setTokenErrorMessage(t("resetPassword.invalidToken"));
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
      if (err instanceof ApiError && err.code === "INVALID_OR_EXPIRED_TOKEN") {
        setTokenStatus("invalid");
        setTokenErrorMessage(
          getErrorMessage(err, t("resetPassword.invalidToken"))
        );
        return;
      }
      applyFormSubmitError(err, setError);
      submitError.fail(err);
    }
  };

  if (tokenStatus === "loading") {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-sm text-neutral-500"
        role="status"
      >
        <Spinner className="mb-2 h-6 w-6 text-brand-600" />
        <p>
          {t("resetPassword.verifyingToken") || "Đang kiểm tra liên kết..."}
        </p>
      </div>
    );
  }

  if (tokenStatus === "invalid" || !token) {
    const defaultMsg = !token
      ? t("resetPassword.invalidToken")
      : t("resetPassword.expiredToken") ||
        "This link is invalid or has expired.";
    return (
      <div className="space-y-3 rounded-12 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p
          className="rounded-8 border border-red-200 bg-red-50/50 p-2 text-red-700"
          role="alert"
        >
          {tokenErrorMessage || defaultMsg}
        </p>
        <Link
          className={buttonVariants({ size: "md" })}
          to={ROUTES.forgotPassword}
        >
          {t("resetPassword.requestNewLink")}
        </Link>
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
