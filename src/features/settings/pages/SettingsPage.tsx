import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { SettingsNav } from "@/features/settings/components/SettingsNav";
import { AccountSection } from "@/features/settings/components/AccountSection";
import { SecuritySection } from "@/features/settings/components/SecuritySection";
import { ConnectedAccountsSection } from "@/features/settings/components/ConnectedAccountsSection";
import { NotificationsSection } from "@/features/settings/components/NotificationsSection";
import { PrivacyDataSection } from "@/features/settings/components/PrivacyDataSection";
import { DangerZoneSection } from "@/features/settings/components/DangerZoneSection";
import { SettingsSaveBar } from "@/features/settings/components/SettingsSaveBar";
import type { UserRole } from "@/types/user";
import { resolveVisiblePath } from "@/features/sprints/sprint-visibility";
import { useTranslation } from "@/i18n/useTranslation";

const dashboardRouteForRole = (role?: UserRole): string => {
  if (role === "EMPLOYER") return ROUTES.employerDashboard;
  if (role === "ADMIN") return ROUTES.admin;
  return ROUTES.talent;
};

export const SettingsPage = () => {
  const { t } = useTranslation("settings");
  useDocumentTitle(t("page.docTitle"));
  const { user } = useAuth();
  const dashboardRoute = resolveVisiblePath(
    dashboardRouteForRole(user?.role),
    ROUTES.home
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1100px] px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] text-neutral-500">
            <Link
              className="rounded-8 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
              to={dashboardRoute}
            >
              {t("page.dashboard")}
            </Link>
            <span>·</span>
            <span>{t("page.crumb")}</span>
          </div>
          <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
            {t("page.title")}
            <em className="font-serif-italic text-brand-700">
              {t("page.titleEm")}
            </em>
          </h1>
          <p className="text-[15px] text-neutral-500">
            {t("page.desc1")}
            <Link
              className="rounded-8 text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.profile}
            >
              {t("page.profileSetup")}
            </Link>
            {t("page.desc2")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[180px_1fr]">
          <SettingsNav />

          <div className="space-y-2">
            <AccountSection />
            <SecuritySection />
            <ConnectedAccountsSection />
            <NotificationsSection />
            <PrivacyDataSection />
            <DangerZoneSection />
            <SettingsSaveBar dashboardRoute={dashboardRoute} />
          </div>
        </div>
      </div>
    </div>
  );
};
