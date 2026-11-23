import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import {
  useConfirmEmployerVerification,
  useVerifyEmployerCode,
} from "@/features/employer/employer.queries";
import {
  verifyCodeSchema,
  type VerifyCodeFormValues,
} from "@/features/employer/employer.schemas";
import { TextField } from "@/components/shared/TextField";
import { Button, buttonVariants } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/spinner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";
import { applyFormSubmitError } from "@/utils/form-errors";
import { useSubmitError } from "@/hooks/useSubmitError";

export const EmployerVerifyPage = () => {
  const { t } = useTranslation("employer");
  useDocumentTitle(t("verify.docTitle"));
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const confirmVerification = useConfirmEmployerVerification();
  const verifyCode = useVerifyEmployerCode();
  const submitError = useSubmitError();

  const [status, setStatus] = useState<
    "loading" | "form" | "success" | "error"
  >(token ? "loading" : "form");
  const ranOnce = useRef(false);

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

  useEffect(() => {
    if (ranOnce.current || !token) return;
    ranOnce.current = true;

    confirmVerification
      .mutateAsync(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token, confirmVerification]);

  const onCodeSubmit = async (values: VerifyCodeFormValues) => {
    submitError.clear();
    try {
      await verifyCode.mutateAsync(values.code);
      setStatus("success");
    } catch (err) {
      applyFormSubmitError(err, setError);
      submitError.fail(err);
      reset({ code: "" });
    }
  };

  if (status === "loading") return <FullPageLoader />;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-md flex-col items-center justify-center px-8 py-12 text-center">
      {status === "success" ? (
        <>
          <CheckCircle2 className="mb-4 text-brand-600" size={40} />
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-neutral-900">
            {t("verify.successTitle")}
          </h1>
          <p className="mb-8 text-sm text-neutral-500">
            {t("verify.successDesc")}
          </p>
          <Link className={buttonVariants()} to={ROUTES.employerDashboard}>
            {t("verify.goDashboard")}
          </Link>
        </>
      ) : status === "form" ? (
        <div className="w-full rounded-20 border border-neutral-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
              <ShieldCheck size={26} />
            </span>
            <h1 className="text-[20px] font-semibold text-neutral-900">
              {t("verifyCompany.title")}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {t("verifyCompany.sentTo", { email: "email công ty của bạn" })}
            </p>
          </div>

          {submitError.message && (
            <div className="mb-4 rounded-8 bg-red-50 p-3 text-left text-xs text-red-600">
              {submitError.message}
            </div>
          )}

          <form
            className="flex flex-col gap-4 text-left"
            onSubmit={handleSubmit(onCodeSubmit)}
          >
            <TextField
              autoComplete="one-time-code"
              error={errors.code?.message}
              id="verification-code"
              label={t("verifyCompany.codeLabel")}
              placeholder={t("verifyCompany.codePlaceholder")}
              registration={register("code")}
            />

            <Button
              className="w-full"
              disabled={verifyCode.isPending}
              isLoading={verifyCode.isPending}
              type="submit"
            >
              {t("verifyCompany.verify")}
            </Button>
          </form>

          <div className="mt-6 border-t border-neutral-100 pt-4">
            <Link
              className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
              to={ROUTES.employerDashboard}
            >
              {t("verify.goDashboard")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <XCircle className="mb-4 text-red-500" size={40} />
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-neutral-900">
            {t("verify.errorTitle")}
          </h1>
          <p className="mb-6 text-sm text-neutral-500">
            {t("verify.errorDesc")}
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => setStatus("form")}>
              {t("verifyCompany.verify")}
            </Button>
            <Link
              className={buttonVariants({ variant: "ghost" })}
              to={ROUTES.employerDashboard}
            >
              {t("verify.goDashboard")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
