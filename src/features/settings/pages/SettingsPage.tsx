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

const dashboardRouteForRole = (role?: UserRole): string => {
  if (role === "EMPLOYER") return ROUTES.employerDashboard;
  if (role === "ADMIN") return ROUTES.admin;
  return ROUTES.talent;
};

export const SettingsPage = () => {
  useDocumentTitle("Settings");
  const { user } = useAuth();
  const dashboardRoute = dashboardRouteForRole(user?.role);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="mx-auto max-w-[1100px] px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] text-neutral-500">
            <Link className="hover:text-neutral-700" to={dashboardRoute}>
              ← Dashboard
            </Link>
            <span>·</span>
            <span>Settings</span>
          </div>
          <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
            Your account,{" "}
            <em className="font-serif-italic text-brand-700">your rules.</em>
          </h1>
          <p className="text-[15px] text-neutral-500">
            Sign-in, security, and how RemoteSEA talks to you. Profile content
            lives under{" "}
            <Link
              className="text-brand-600 hover:text-brand-700"
              to={ROUTES.profile}
            >
              Profile setup
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
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
