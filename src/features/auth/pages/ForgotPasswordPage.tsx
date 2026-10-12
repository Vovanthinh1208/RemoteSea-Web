import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n";

export const ForgotPasswordPage = () => {
  const { t } = useTranslation("auth");
  useDocumentTitle(t("forgotPassword.title"));

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-md flex-col justify-center px-8 py-12">
      <Link
        className="mb-10 inline-flex items-center gap-1.5 rounded-8 text-sm text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
        to={ROUTES.login}
      >
        <ArrowLeft size={14} /> {t("forgotPassword.backToSignIn")}
      </Link>

      <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
        {t("forgotPassword.title")}
      </h1>
      <p className="mb-8 text-sm text-neutral-500">
        {t("forgotPassword.subtitle")}
      </p>

      <ForgotPasswordForm />
    </div>
  );
};
