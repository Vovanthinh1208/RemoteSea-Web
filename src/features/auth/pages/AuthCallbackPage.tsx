import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { FullPageLoader } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { resolveVisiblePath } from "@/features/sprints/sprint-visibility";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation("auth");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get("code");
    if (!code) {
      toast({
        title: t("callback.failedTitle"),
        description: t("callback.missingCode"),
        variant: "error",
      });
      navigate(ROUTES.login, { replace: true });
      return;
    }

    completeOAuthExchange(code)
      .then((user) => {
        navigate(
          resolveVisiblePath(
            user.role === "EMPLOYER" ? ROUTES.employerDashboard : ROUTES.talent,
            ROUTES.settings
          ),
          {
            replace: true,
          }
        );
      })
      .catch(() => {
        toast({
          title: t("callback.failedTitle"),
          description: t("callback.tryAgain"),
          variant: "error",
        });
        navigate(ROUTES.login, { replace: true });
      });
  }, [searchParams, completeOAuthExchange, navigate, toast, t]);

  return <FullPageLoader />;
};
