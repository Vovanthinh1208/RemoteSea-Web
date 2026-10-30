import { describe, expect, it } from "vitest";
import { dashboardRouteForRole } from "./role-home";

// PB02 AC4.4: sign-in lands on the home/dashboard of the user's role.
describe("dashboardRouteForRole", () => {
  it("maps each role to its own home", () => {
    expect(dashboardRouteForRole("TALENT")).toBe("/talent");
    expect(dashboardRouteForRole("EMPLOYER")).toBe("/employer-dashboard");
    expect(dashboardRouteForRole("ADMIN")).toBe("/admin");
  });
});
