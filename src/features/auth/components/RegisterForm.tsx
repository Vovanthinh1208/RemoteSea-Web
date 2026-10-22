import { useForm } from "react-hook-form";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/auth.schemas";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { OrDivider } from "@/features/auth/components/OrDivider";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";
import { isSafeInternalPath } from "@/utils/safe-redirect";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { resolveVisiblePath } from "@/features/sprints/sprint-visibility";
import { useTranslation } from "@/i18n";

export const RegisterForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl && isSafeInternalPath(rawCallbackUrl)
      ? rawCallbackUrl
      : null;
  const { registerAccount } = useAuth();
  const { toast } = useToast();
  const submitError = useSubmitError();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "TALENT",
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;
  // Field errors on screen re-validate in the new language after a switch.
  useRevalidateOnLocaleChange(form);

  const role = watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    submitError.clear();
    try {
      const user = await registerAccount(values);
      navigate(
        callbackUrl ??
          resolveVisiblePath(
            user.role === "EMPLOYER" ? ROUTES.employerDashboard : "/profile",
            ROUTES.settings
          ),
        { replace: true }
      );
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
      toast({ title: t("register.failedToast"), variant: "error" });
    }
  };

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {(
          [
            { value: "TALENT", label: t("register.roleTalent") },
            { value: "EMPLOYER", label: t("register.roleEmployer") },
          ] as const
        ).map((option) => (
          <button
            className={cn(
              "h-10 rounded-12 border text-sm font-medium transition-all focus-visible:shadow-focus focus-visible:outline-none",
              role === option.value
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}
            key={option.value}
            type="button"
            onClick={() => setValue("role", option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <OAuthButtons />
      <OrDivider label={t("login.orContinueWith")} />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          error={errors.name?.message}
          id="name"
          label={t("register.nameLabel")}
          placeholder={t("register.namePlaceholder")}
          autoComplete="name"
          registration={register("name")}
        />

        <TextField
          error={errors.email?.message}
          id="email"
          label={t("register.emailLabel")}
          placeholder={t("register.emailPlaceholder")}
          autoComplete="email"
          registration={register("email")}
          type="email"
        />

        <TextField
          error={errors.password?.message}
          id="password"
          label={t("register.passwordLabel")}
          placeholder={t("register.passwordPlaceholder")}
          autoComplete="new-password"
          registration={register("password")}
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
          {isSubmitting ? t("register.submitting") : t("register.submit")}
        </Button>
        <p className="text-center text-[12px] text-neutral-400">
          {t("register.termsPrefix")}
          <Link
            className="rounded-4 text-neutral-600 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
            to="/terms"
          >
            {t("register.terms")}
          </Link>
          {t("register.and")}
          <Link
            className="rounded-4 text-neutral-600 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
            to="/privacy"
          >
            {t("register.privacy")}
          </Link>
          {t("register.termsSuffix")}
        </p>
      </form>
    </>
  );
};
