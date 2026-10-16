import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/auth.schemas";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { OrDivider } from "@/features/auth/components/OrDivider";
import { TwoFactorChallengeForm } from "@/features/auth/components/TwoFactorChallengeForm";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";
import { isSafeInternalPath } from "@/utils/safe-redirect";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

export const LoginForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl && isSafeInternalPath(rawCallbackUrl)
      ? rawCallbackUrl
      : ROUTES.jobs;
  const { login } = useAuth();
  const { toast } = useToast();
  const submitError = useSubmitError();
  const [challenge, setChallenge] = useState<{
    challengeToken: string;
    remember: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: LoginFormValues) => {
    submitError.clear();
    try {
      const result = await login(
        values.email,
        values.password,
        values.remember
      );
      if (result.status === "two_factor_required") {
        setChallenge({
          challengeToken: result.challengeToken,
          remember: values.remember,
        });
        return;
      }
      navigate(callbackUrl, { replace: true });
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
      toast({ title: t("login.failedToast"), variant: "error" });
    }
  };

  if (challenge) {
    return (
      <TwoFactorChallengeForm
        challengeToken={challenge.challengeToken}
        remember={challenge.remember}
        onBack={() => setChallenge(null)}
        onSuccess={() => navigate(callbackUrl, { replace: true })}
      />
    );
  }

  return (
    <>
      <OAuthButtons />
      <OrDivider label={t("login.orContinueWith")} />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          error={errors.email?.message}
          id="email"
          label={t("login.emailLabel")}
          placeholder={t("login.emailPlaceholder")}
          autoComplete="email"
          registration={register("email")}
          type="email"
        />

        <TextField
          error={errors.password?.message}
          id="password"
          label={t("login.passwordLabel")}
          labelSlot={
            <Link
              className="rounded-4 text-xs text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.forgotPassword}
            >
              {t("login.forgotPassword")}
            </Link>
          }
          placeholder={t("login.passwordPlaceholder")}
          autoComplete="current-password"
          registration={register("password")}
          type="password"
        />

        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
            type="checkbox"
            {...register("remember")}
          />
          {t("login.rememberMe")}
        </label>

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
          {isSubmitting ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>
    </>
  );
};
