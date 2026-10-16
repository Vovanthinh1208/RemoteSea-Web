import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/types/user";
import { useTranslation } from "@/i18n/useTranslation";

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { user, status, retrySession } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (status === "loading") return <FullPageLoader />;

  // A token exists but we couldn't confirm the session (network/5xx, not a real
  // 401) — don't bounce a possibly-still-logged-in user out to /login, offer a retry.
  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-lg font-semibold text-neutral-900">
          {t("common.session.confirmFailedTitle")}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {t("common.session.confirmFailedDesc")}
        </p>
        <Button className="mt-5" variant="primary" onClick={retrySession}>
          {t("common.actions.retry")}
        </Button>
      </div>
    );
  }

  if (!user) {
    const callbackUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate replace to={`${ROUTES.login}?callbackUrl=${callbackUrl}`} />
    );
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate replace to={ROUTES.home} />;
  }

  return <Outlet />;
};
