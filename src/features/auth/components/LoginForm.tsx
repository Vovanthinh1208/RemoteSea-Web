import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "@/features/auth/auth.schemas";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { OrDivider } from "@/features/auth/components/OrDivider";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { applyFormSubmitError } from "@/utils/form-errors";
import { isSafeInternalPath } from "@/utils/safe-redirect";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl && isSafeInternalPath(rawCallbackUrl) ? rawCallbackUrl : ROUTES.jobs;
  const { login } = useAuth();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setFormError(null);
    setIsLoading(true);
    try {
      await login(values.email, values.password, values.remember);
      navigate(callbackUrl, { replace: true });
    } catch (err) {
      setFormError(applyFormSubmitError(err, setError, "Something went wrong. Please try again."));
      toast({ title: "Sign in failed", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <OAuthButtons />
      <OrDivider label="or with email" />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          error={errors.email?.message}
          id="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          registration={register("email")}
          type="email"
        />

        <TextField
          error={errors.password?.message}
          id="password"
          label="Password"
          labelSlot={
            <Link
              className="text-xs text-brand-600 hover:text-brand-700"
              to={ROUTES.forgotPassword}
            >
              Forgot?
            </Link>
          }
          placeholder="••••••••"
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
          Remember me
        </label>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <Button
          className="w-full rounded-12"
          disabled={isSubmitting}
          size="lg"
          type="submit"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>
    </>
  );
};
