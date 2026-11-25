import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useConfirmTalentVerification } from "@/features/talent/talent.queries";
import { FullPageLoader } from "@/components/ui/spinner";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

export const TalentVerifyPage = () => {
  const { t } = useTranslation("talent");
  useDocumentTitle(t("verifyPage.docTitle"));
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const confirmVerification = useConfirmTalentVerification();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current || !token) return;
    ranOnce.current = true;

    confirmVerification
      .mutateAsync(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token, confirmVerification]);

  if (status === "loading") return <FullPageLoader />;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-md flex-col items-center justify-center px-8 py-12 text-center">
      {status === "success" ? (
        <>
          <CheckCircle2 className="mb-4 text-brand-600" size={40} />
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-neutral-900">
            {t("verifyPage.successTitle")}
          </h1>
          <p className="mb-8 text-sm text-neutral-500">
            {t("verifyPage.successDesc")}
          </p>
          <Link className={buttonVariants()} to={ROUTES.talent}>
            {t("verifyPage.goDashboard")}
          </Link>
        </>
      ) : (
        <div className="relative w-full rounded-16 border border-red-200 bg-red-50/50 p-6">
          <button
            aria-label="Close"
            className="absolute right-3 top-3 text-base font-medium text-neutral-500 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => {}}
          >
            ×
          </button>
          <XCircle className="mx-auto mb-4 text-red-500" size={40} />
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-neutral-900">
            {t("verifyPage.errorTitle")}
          </h1>
          <p className="mb-8 text-sm text-neutral-500">
            {t("verifyPage.errorDesc")}
          </p>
          <Link className={buttonVariants()} to={ROUTES.talent}>
            {t("verifyPage.goDashboard")}
          </Link>
        </div>
      )}
    </div>
  );
};
