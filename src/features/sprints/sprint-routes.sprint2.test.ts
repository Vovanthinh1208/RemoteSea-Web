import { describe, expect, it } from "vitest";
import { sprintForPath } from "./sprint-routes";

// Screens added for Sprint 2 (PB27, PB31, PB42) and the Product Backlog's
// documented paths that redirect to the real routes belong to Sprint 2.
describe("Sprint 2 routes", () => {
  it.each([
    "/talent/profile/views",
    "/employer/company/settings",
    "/employer/jobs/abc123/edit",
    "/talent/dashboard",
    "/talents",
    "/talents/ada",
    "/employer/dashboard",
    "/employer/team",
    "/employer/jobs/new",
    "/employer/onboarding",
    "/team/invitation",
  ])("%s is a Sprint 2 route", (path) => {
    expect(sprintForPath(path)).toBe(2);
  });

  it("keeps the Sprint 1 profile editor on Sprint 1", () => {
    expect(sprintForPath("/talent/profile")).toBe(1);
  });
});
