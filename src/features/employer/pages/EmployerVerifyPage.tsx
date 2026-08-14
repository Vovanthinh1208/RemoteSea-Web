import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useConfirmEmployerVerification } from "@/features/employer/employer.queries";
import { FullPageLoader } from "@/components/ui/spinner";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";

// Landing target for the link in EmailService.sendEmployerVerificationEmail:
// `<FRONTEND_URL>/employer/verify?token=<token>`. Unauthenticated by design —
// the token itself is the proof, same as the password-reset confirm flow —
// so this renders its own success/error state rather than assuming a
// logged-in session to redirect into.
export const EmployerVerifyPage = () => {
  useDocumentTitle("Verify Your Company");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const confirmVerification = useConfirmEmployerVerification();
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
    <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md flex-col items-center justify-center px-8 py-12 text-center">
      {status === "success" ? (
        <>
          <CheckCircle2 className="mb-4 text-brand-600" size={40} />
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-neutral-900">
            Company verified
          </h1>
          <p className="mb-8 text-sm text-neutral-500">
            Your Verified badge is live and eligible jobs now publish
            immediately.
          </p>
          <Link className={buttonVariants()} to={ROUTES.employerDashboard}>
            Go to dashboard
          </Link>
        </>
      ) : (
        <>
          <XCircle className="mb-4 text-red-500" size={40} />
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-neutral-900">
            Link expired or invalid
          </h1>
          <p className="mb-8 text-sm text-neutral-500">
            Request a new verification email from your employer dashboard.
          </p>
          <Link className={buttonVariants()} to={ROUTES.employerDashboard}>
            Go to dashboard
          </Link>
        </>
      )}
    </div>
  );
};
