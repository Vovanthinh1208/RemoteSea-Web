import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { FullPageLoader } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";

/**
 * Landing target for the backend's OAuth redirect:
 * `<FRONTEND_URL>/auth/callback?code=<exchangeCode>` (see remotesea-api docs/API.md,
 * GET /auth/google|github|linkedin). `code` is short-lived and single-purpose —
 * never the real access token itself (see POST /auth/oauth/exchange) — so it's
 * safe for it to sit in this URL/browser history the way a raw token wouldn't be.
 */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuthExchange } = useAuth();
  const { toast } = useToast();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get("code");
    if (!code) {
      toast({
        title: "Sign in failed",
        description: "Missing authentication code.",
        variant: "error",
      });
      navigate(ROUTES.login, { replace: true });
      return;
    }

    completeOAuthExchange(code)
      .then((user) => {
        navigate(
          user.role === "EMPLOYER" ? ROUTES.employerDashboard : ROUTES.talent,
          {
            replace: true,
          }
        );
      })
      .catch(() => {
        toast({
          title: "Sign in failed",
          description: "Please try again.",
          variant: "error",
        });
        navigate(ROUTES.login, { replace: true });
      });
  }, [searchParams, completeOAuthExchange, navigate, toast]);

  return <FullPageLoader />;
};
