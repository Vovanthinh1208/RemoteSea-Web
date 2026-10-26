import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";

// PB28 AC2.2: a VERIFIED_EMPLOYERS profile opened by a guest or an employer
// without the Verified badge. No profile detail is shown (the API sends
// none) — only why, and the way in.
export const PublicTalentRestricted = () => {
  const { t } = useTranslation("talent");
  const { user } = useAuth();
  const isEmployer = user?.role === "EMPLOYER";

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <ShieldCheck size={20} />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900">
        {t("public.restrictedTitle")}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {isEmployer
          ? t("public.restrictedDescEmployer")
          : t("public.restrictedDesc")}
      </p>
      {isEmployer ? (
        <Link className="mt-6" to={ROUTES.employerDashboard}>
          <Button variant="primary">{t("public.restrictedVerify")}</Button>
        </Link>
      ) : (
        <Link className="mt-6" to={ROUTES.login}>
          <Button variant="primary">{t("public.restrictedLogin")}</Button>
        </Link>
      )}
    </div>
  );
};
