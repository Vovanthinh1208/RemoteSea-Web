import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
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
import { resolveVisiblePath } from "@/features/sprints/sprint-visibility";
import { dashboardRouteForRole } from "@/features/auth/role-home";
import type { AuthUser } from "@/types/user";
import { useTranslation } from "@/i18n";

export const LoginForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl =
    rawCallbackUrl && isSafeInternalPath(rawCallbackUrl)
      ? rawCallbackUrl
      : null;
  // PB02 AC4.4: an explicit callbackUrl wins; otherwise the role's home.
  const destinationFor = (user: AuthUser): string =>
    safeCallbackUrl ??
    resolveVisiblePath(dashboardRouteForRole(user.role), ROUTES.settings);
  const { login } = useAuth();
  const { toast } = useToast();
  const submitError = useSubmitError();
  const [challenge, setChallenge] = useState<{
    challengeToken: string;
    remember: boolean;
  } | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;
  // Field errors on screen re-validate in the new language after a switch.
  useRevalidateOnLocaleChange(form);

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
      navigate(destinationFor(result.user), { replace: true });
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
        onSuccess={(user) => navigate(destinationFor(user), { replace: true })}
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
