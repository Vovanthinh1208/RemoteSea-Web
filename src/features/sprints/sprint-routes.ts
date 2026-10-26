import { matchPath } from "react-router-dom";

// Which sprint's PBIs own each app route (docs/PRODUCT_BACKLOG_OFFICIAL.md §2.3).
// "unassigned" = a marketing/content page that no PBI covers. Routes missing
// from this table (home "/", the 404 catch-all) are shell routes: always shown.
// Order matters — specific patterns before parameterised ones.
export type RouteSprint = number | "unassigned";

const ROUTE_SPRINTS: ReadonlyArray<readonly [pattern: string, RouteSprint]> = [
  // Sprint 1 — PB01–PB22: auth, account settings, talent profile + email verify
  ["/login", 1],
  ["/register", 1],
  ["/forgot-password", 1],
  ["/reset-password", 1],
  ["/auth/callback", 1],
  ["/settings", 1],
  ["/profile", 1],
  ["/talent/profile", 1],
  ["/talent/verify", 1],
  ["/sprints", 1],

  // Sprint 2 — PB23–PB48: profile extras, talent search, employer, team, job posts
  ["/talent", 2],
  ["/talent/profile/views", 2],
  ["/talent/dashboard", 2],
  ["/talents", 2],
  ["/talents/:slug", 2],
  ["/talent/:slug", 2],
  ["/companies/:slug", 2],
  ["/employer/verify", 2],
  ["/team/invitations/:token", 2],
  ["/post-job", 2],
  ["/post-job/success", 2],
  ["/employer-dashboard", 2],
  ["/employer-dashboard/talent", 2],
  ["/employer-dashboard/team", 2],
  ["/employer/jobs/:id/edit", 2],
  ["/employer/company/settings", 2],
  ["/employer/dashboard", 2],
  ["/employer/team", 2],
  ["/employer/jobs/new", 2],
  ["/employer/onboarding", 2],
  ["/team/invitation", 2],
  ["/jobs", 2],
  ["/jobs/:id", 2],

  // Sprint 3 — PB49–PB74: saved, applications, interviews, messaging, notifications
  ["/saved", 3],
  ["/applications/:id", 3],
  ["/applications/:id/messages", 3],
  ["/applications/:id/interview", 3],
  ["/employer-dashboard/applications/:id", 3],
  ["/employer-dashboard/interviews", 3],
  ["/notifications", 3],

  // Sprint 4 — PB75–PB96: alerts, salary insights, admin, AI assistant
  ["/alerts", 4],
  ["/salary", 4],
  ["/admin", 4],

  // No PBI covers these
  ["/employer", "unassigned"],
  ["/blog", "unassigned"],
  ["/community", "unassigned"],
];

/** Owning sprint for a pathname, or null for shell routes that are always shown. */
export const sprintForPath = (pathname: string): RouteSprint | null => {
  for (const [pattern, sprint] of ROUTE_SPRINTS) {
    if (matchPath({ path: pattern, end: true }, pathname)) return sprint;
  }
  return null;
};
