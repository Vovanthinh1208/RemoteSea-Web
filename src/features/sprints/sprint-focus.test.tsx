import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n";
import { MemoryRouter } from "react-router-dom";
import { SprintUnavailablePage } from "./pages/SprintUnavailablePage";
import { sprintForPath } from "./sprint-routes";
import {
  parseSprintFocus,
  isPathVisible,
  isSprintShown,
  resolveVisiblePath,
} from "./sprint-visibility";

const sprint1 = parseSprintFocus("1");

describe("parseSprintFocus", () => {
  it("means 'no limiting' when unset, blank or 'all'", () => {
    expect(parseSprintFocus(undefined)).toBeNull();
    expect(parseSprintFocus("")).toBeNull();
    expect(parseSprintFocus(" ALL ")).toBeNull();
  });

  it("parses a sprint list", () => {
    expect([...(parseSprintFocus("1, 3") ?? [])]).toEqual([1, 3]);
  });
});

describe("sprintForPath", () => {
  it.each([
    ["/login", 1],
    ["/register", 1],
    ["/settings", 1],
    ["/profile", 1],
    ["/talent/profile", 1],
    ["/talent/verify", 1],
    ["/talent", 2],
    ["/talent/jane-doe", 2],
    ["/jobs", 2],
    ["/jobs/abc123", 2],
    ["/employer-dashboard/talent", 2],
    ["/applications/a1", 3],
    ["/applications/a1/messages", 3],
    ["/employer-dashboard/applications/a1", 3],
    ["/notifications", 3],
    ["/alerts", 4],
    ["/salary", 4],
    ["/admin", 4],
    ["/blog", "unassigned"],
    ["/employer", "unassigned"],
  ])("maps %s to sprint %s", (path, sprint) => {
    expect(sprintForPath(path)).toBe(sprint);
  });

  it("leaves the home page and unknown paths as always-shown shell routes", () => {
    expect(sprintForPath("/")).toBeNull();
    expect(sprintForPath("/nope")).toBeNull();
  });
});

describe("with Sprint 1 focus", () => {
  it("shows Sprint 1 screens and the shell, hides everything else", () => {
    for (const p of [
      "/",
      "/login",
      "/register",
      "/settings",
      "/profile",
      "/talent/profile",
      "/talent/verify",
    ])
      expect(isPathVisible(p, sprint1)).toBe(true);
    for (const p of [
      "/jobs",
      "/talent",
      "/saved",
      "/alerts",
      "/admin",
      "/blog",
      "/employer-dashboard",
    ])
      expect(isPathVisible(p, sprint1)).toBe(false);
  });

  it("is a no-op without focus", () => {
    expect(isPathVisible("/admin", null)).toBe(true);
    expect(isSprintShown(4, null)).toBe(true);
  });

  it("redirects a hidden default destination to the fallback and keeps visible ones", () => {
    expect(resolveVisiblePath("/jobs", "/settings", sprint1)).toBe("/settings");
    expect(resolveVisiblePath("/profile?x=1", "/settings", sprint1)).toBe(
      "/profile?x=1"
    );
    expect(resolveVisiblePath("/jobs", "/settings", null)).toBe("/jobs");
  });

  it("hides the AI assistant (Sprint 4) and notifications (Sprint 3) but not Sprint 1", () => {
    expect(isSprintShown(4, sprint1)).toBe(false);
    expect(isSprintShown(3, sprint1)).toBe(false);
    expect(isSprintShown(1, sprint1)).toBe(true);
  });
});

describe("with Sprint 1+2 focus", () => {
  const sprint12 = parseSprintFocus("1,2");

  it("shows Sprint 1 and Sprint 2 screens", () => {
    for (const p of [
      "/login",
      "/settings",
      "/profile",
      "/talent/profile",
      "/talent/verify",
      "/jobs",
      "/jobs/abc123",
      "/talent",
      "/talent/jane-doe",
      "/companies/acme",
      "/employer/verify",
      "/team/invitations/tok",
      "/post-job",
      "/post-job/success",
      "/employer-dashboard",
      "/employer-dashboard/talent",
      "/employer-dashboard/team",
    ])
      expect(isPathVisible(p, sprint12)).toBe(true);
  });

  it("still hides Sprint 3, Sprint 4 and unassigned screens", () => {
    for (const p of [
      "/saved",
      "/applications/a1",
      "/employer-dashboard/applications/a1",
      "/employer-dashboard/interviews",
      "/notifications",
      "/alerts",
      "/salary",
      "/admin",
      "/employer",
      "/blog",
    ])
      expect(isPathVisible(p, sprint12)).toBe(false);
  });

  it("keeps Sprint 2 post-login destinations instead of falling back", () => {
    expect(resolveVisiblePath("/jobs", "/settings", sprint12)).toBe("/jobs");
    expect(
      resolveVisiblePath("/employer-dashboard", "/settings", sprint12)
    ).toBe("/employer-dashboard");
  });
});

describe("route table coverage", () => {
  const files = import.meta.glob("/src/router/AppRouter.tsx", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;
  const source = Object.values(files)[0];

  it("assigns an owning sprint to every routed path (new routes must be classified)", () => {
    const paths = [...source.matchAll(/path="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((p) => p !== "*" && p !== "/");
    expect(paths.length).toBeGreaterThan(20);
    const unmapped = paths.filter(
      (p) => sprintForPath(`/${p}`.replace(/:[^/]+/g, "x")) === null
    );
    expect(unmapped).toEqual([]);
  });
});

describe("SprintUnavailablePage", () => {
  it("names the owning sprint and the focus sprint", () => {
    render(
      <I18nProvider>
        <MemoryRouter>
          <SprintUnavailablePage focus={sprint1} sprint={2} />
        </MemoryRouter>
      </I18nProvider>
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByText(/Sprint 2/).textContent).toMatch(/Sprint 1/);
  });
});
