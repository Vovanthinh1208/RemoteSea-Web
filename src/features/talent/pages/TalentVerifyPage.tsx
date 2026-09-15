import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useConfirmTalentVerification } from "@/features/talent/talent.queries";
import { FullPageLoader } from "@/components/ui/spinner";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";

export const TalentVerifyPage = () => {
  useDocumentTitle("Verify Your Email");
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
            Email verified
          </h1>
          <p className="mb-8 text-sm text-neutral-500">
            Your Verified badge is now live on your profile.
          </p>
          <Link className={buttonVariants()} to={ROUTES.talent}>
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
            Request a new verification email from your dashboard.
          </p>
          <Link className={buttonVariants()} to={ROUTES.talent}>
            Go to dashboard
          </Link>
        </>
      )}
    </div>
  );
};
