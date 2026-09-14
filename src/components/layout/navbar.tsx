import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Bookmark, Menu, Settings, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { prefetchRoute } from "@/router/route-prefetch";
import { NotificationBell } from "@/components/layout/NotificationBell";

const NAV_LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/salary", label: "Salary" },
  { href: "/community", label: "Community" },
  { href: "/blog", label: "Blog" },
];

// Shared by both the desktop row and the mobile panel below — same content,
// laid out differently — so a role/link change can't update one and miss
// the other the way two independently hand-written lists could.
// h-9, matching the icon buttons (Bookmark/NotificationBell/Settings) these
// share a row with — was py-1.5 (no fixed height), which rendered ~4px
// shorter than its icon-button neighbors and broke the row's alignment.
const ACTION_LINK_CLASS =
  "inline-flex h-9 items-center rounded-8 px-3 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none";

// The mobile panel's own row style — was the same six-class string retyped
// on every link/button in the panel.
const MOBILE_ACTION_LINK_CLASS =
  "rounded-8 px-3 py-2.5 text-[15px] text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dashboardHref =
    user?.role === "EMPLOYER" ? ROUTES.employerDashboard : ROUTES.talent;
  const [mobileOpen, setMobileOpen] = useState(false);
  // Reset-during-render (React's own pattern for "adjust state when a prop
  // changes"), not a setState-in-effect — a route change never reloads the
  // page (react-router), so a menu left open from before a nav-link tap
  // would otherwise still be sitting open over the new page. Doing this in
  // an effect would commit the still-open menu for one frame first, then
  // close it on the next render; this closes it in the same render as the
  // navigation.
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  const handleSignOut = () => {
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
            Jobs · SEA
          </span>
        </Link>

        {/* Nav links — desktop only; the mobile panel below repeats these.
            lg, not md: the guest desktop row (logo + tagline + 4 nav links +
            "For employers"/"Sign in"/"Get job alerts") needs ~900px, so a
            768px (md) switch-over left a genuine ~130px horizontal-overflow
            gap between 768–899px, not just a design preference. */}
        <nav className="hidden gap-1 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
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
        <div className="hidden items-center gap-2 lg:flex">
          <Link className={ACTION_LINK_CLASS} to={ROUTES.employer}>
            For employers
          </Link>

          <Link
            aria-label="Saved jobs"
            className="grid h-9 w-9 place-items-center rounded-8 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
            to={ROUTES.saved}
          >
            <Bookmark size={17} />
          </Link>

          {user ? (
            <>
              <Link className={ACTION_LINK_CLASS} to={dashboardHref}>
                Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link className={ACTION_LINK_CLASS} to={ROUTES.admin}>
                  Admin
                </Link>
              )}
              <NotificationBell />
              <Link
                aria-label="Settings"
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
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className={ACTION_LINK_CLASS} to={ROUTES.login}>
                Sign in
              </Link>

              <Link className={buttonVariants()} to={ROUTES.register}>
                <Bell size={14} />
                Get job alerts
              </Link>
            </>
          )}
        </div>

        {/* Mobile: notifications (self-contained, frequent enough to keep at
            a glance) stay visible; everything else collapses into the panel
            below the hamburger toggle. */}
        <div className="flex items-center gap-1 lg:hidden">
          {user && <NotificationBell />}
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="grid h-9 w-9 place-items-center rounded-8 text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-neutral-100 bg-neutral-50 px-4 py-3 lg:hidden">
          <div className="flex flex-col">
            {NAV_LINKS.map(({ href, label }) => (
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

          <div className="flex flex-col">
            <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.employer}>
              For employers
            </Link>
            <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.saved}>
              Saved jobs
            </Link>

            {user ? (
              <>
                <Link className={MOBILE_ACTION_LINK_CLASS} to={dashboardHref}>
                  Dashboard
                </Link>
                {user.role === "ADMIN" && (
                  <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.admin}>
                    Admin
                  </Link>
                )}
                <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.settings}>
                  Settings
                </Link>
                <button
                  className={cn(MOBILE_ACTION_LINK_CLASS, "text-left")}
                  type="button"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className={MOBILE_ACTION_LINK_CLASS} to={ROUTES.login}>
                  Sign in
                </Link>
                <Link
                  className={cn(buttonVariants({ size: "lg" }), "mt-2")}
                  to={ROUTES.register}
                >
                  <Bell size={14} />
                  Get job alerts
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
