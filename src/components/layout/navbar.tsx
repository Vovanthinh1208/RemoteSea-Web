import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Bookmark, Menu, Settings, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { prefetchRoute } from "@/router/route-prefetch";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/i18n/useTranslation";
import {
  isPathVisible,
  isSprintShown,
} from "@/features/sprints/sprint-visibility";

// Shared by both the desktop row and the mobile panel below
const ACTION_LINK_CLASS =
  "inline-flex h-9 items-center rounded-8 px-3 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none";

const MOBILE_ACTION_LINK_CLASS =
  "rounded-8 px-3 py-2.5 text-[15px] text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/jobs", label: t("nav.jobs") },
    { href: "/salary", label: t("nav.salary") },
    { href: "/community", label: t("nav.community") },
    { href: "/blog", label: t("nav.blog") },
  ].filter(({ href }) => isPathVisible(href));

  const dashboardHref =
    user?.role === "EMPLOYER" ? ROUTES.employerDashboard : ROUTES.talent;
  const showEmployers = isPathVisible(ROUTES.employer);
  const showSaved = isPathVisible(ROUTES.saved);
  const showDashboard = isPathVisible(dashboardHref);
  const showAdmin = isPathVisible(ROUTES.admin);
  const showNotifications = isSprintShown(3);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  const handleSignOut = () => setConfirmSignOut(true);

  const performSignOut = () => {
    setConfirmSignOut(false);
    logout();
    navigate(ROUTES.home);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-neutral-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-6 px-6">
        {/* Brand */}
        <Link
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-neutral-900"
          to={ROUTES.home}
        >
          <span
            className="grid h-[26px] w-[26px] place-items-center rounded-8 pb-0.5 font-serif text-lg italic leading-none text-white"
            style={{
              background: "linear-gradient(140deg, #2E9B52, #1F7A3D)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            R
          </span>
          <span>RemoteSEA</span>
          <span className="ml-0.5 hidden border-l border-neutral-200 pl-2.5 text-[11px] font-normal text-neutral-400 sm:inline">
            {t("nav.brandTagline")}
          </span>
        </Link>

        {/* Nav links — desktop only */}
        <nav className="hidden gap-1 xl:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              className={cn(
                "rounded-8 px-3 py-1.5 text-sm transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                location.pathname.startsWith(href)
                  ? "font-medium text-neutral-900"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              )}
              key={href}
              to={href}
              onFocus={() => prefetchRoute(href)}
              onMouseEnter={() => prefetchRoute(href)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Actions — desktop only */}
        <div className="hidden items-center gap-2 xl:flex">
          {showEmployers && (
            <Link className={ACTION_LINK_CLASS} to={ROUTES.employer}>
              {t("nav.forEmployers")}
            </Link>
          )}

          {showSaved && (
            <Link
              aria-label={t("nav.saved")}
              className="grid h-9 w-9 place-items-center rounded-8 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
              to={ROUTES.saved}
            >
              <Bookmark size={17} />
            </Link>
          )}

          <LanguageSwitcher />

          {user ? (
            <>
              {showDashboard && (
                <Link className={ACTION_LINK_CLASS} to={dashboardHref}>
                  {t("nav.dashboard")}
                </Link>
              )}
              {user.role === "ADMIN" && showAdmin && (
                <Link className={ACTION_LINK_CLASS} to={ROUTES.admin}>
                  {t("nav.admin")}
                </Link>
              )}
              {showNotifications && <NotificationBell />}
              <Link
                aria-label={t("nav.settings")}
                className="grid h-9 w-9 place-items-center rounded-8 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
                to={ROUTES.settings}
              >
                <Settings size={17} />
              </Link>
              <button
                className={ACTION_LINK_CLASS}
                type="button"
                onClick={handleSignOut}
              >
                {t("nav.signOut")}
              </button>
            </>
          ) : (
            <>
              <Link className={ACTION_LINK_CLASS} to={ROUTES.login}>
                {t("nav.signIn")}
              </Link>

              <Link className={buttonVariants()} to={ROUTES.register}>
                <Bell size={14} />
                {t("nav.getJobAlerts")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 xl:hidden">
          {user && showNotifications && <NotificationBell />}
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            className="grid h-9 w-9 place-items-center rounded-8 text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-neutral-100 bg-neutral-50 px-4 py-3 xl:hidden">
          <div className="flex flex-col">
            {navLinks.map(({ href, label }) => (
              <Link
                className={cn(
                  "rounded-8 px-3 py-2.5 text-[15px] transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                  location.pathname.startsWith(href)
                    ? "font-medium text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                key={href}
                to={href}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="my-2 border-t border-neutral-200" />

          <LanguageSwitcher variant="mobile" />

          <div className="my-2 border-t border-neutral-200" />

          <div className="flex flex-col">
            {showEmployers && (
              <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.employer}>
                {t("nav.forEmployers")}
              </Link>
            )}
            {showSaved && (
              <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.saved}>
                {t("nav.saved")}
              </Link>
            )}

            {user ? (
              <>
                {showDashboard && (
                  <Link className={MOBILE_ACTION_LINK_CLASS} to={dashboardHref}>
                    {t("nav.dashboard")}
                  </Link>
                )}
                {user.role === "ADMIN" && showAdmin && (
                  <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.admin}>
                    {t("nav.admin")}
                  </Link>
                )}
                <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.settings}>
                  {t("nav.settings")}
                </Link>
                <button
                  className={cn(MOBILE_ACTION_LINK_CLASS, "text-left")}
                  type="button"
                  onClick={handleSignOut}
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.login}>
                  {t("nav.signIn")}
                </Link>
                <Link
                  className={cn(buttonVariants({ size: "lg" }), "mt-2")}
                  to={ROUTES.register}
                >
                  <Bell size={14} />
                  {t("nav.getJobAlerts")}
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
      <ConfirmDialog
        cancelLabel={t("actions.cancel")}
        confirmLabel={t("nav.signOut")}
        description={t("nav.signOutDesc")}
        open={confirmSignOut}
        title={t("nav.signOutTitle")}
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={performSignOut}
      />
    </header>
  );
};
