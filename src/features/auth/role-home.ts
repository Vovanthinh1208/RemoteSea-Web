import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/types/user";

/** Each role's home after sign-in (PB02 AC4.4) and the Settings "back" link. */
export const dashboardRouteForRole = (role?: UserRole): string => {
  if (role === "EMPLOYER") return ROUTES.employerDashboard;
  if (role === "ADMIN") return ROUTES.admin;
  return ROUTES.talent;
};
