import type { Sprint } from "./sprints.data";
import { sprintForPath, type RouteSprint } from "./sprint-routes";

// Testing-phase visibility. Default is Sprint 1 only; the other sprints stay in
// the data (and in the docs/DB untouched) — they are just not rendered.
// Restore with VITE_VISIBLE_SPRINTS=all, or pick some with e.g. "1,2".
export const DEFAULT_VISIBLE_SPRINTS = "1";

export const selectVisibleSprints = (
  sprints: Sprint[],
  raw: string | undefined = DEFAULT_VISIBLE_SPRINTS
): Sprint[] => {
  const value = (raw ?? "").trim().toLowerCase() || DEFAULT_VISIBLE_SPRINTS;
  if (value === "all") return sprints;
  const wanted = new Set(
    value
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((n) => Number.isInteger(n))
  );
  return sprints.filter((sprint) => wanted.has(sprint.id));
};

// The board is an internal testing aid: always on in dev, opt-in elsewhere.
export const isSprintBoardEnabled = (): boolean =>
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_SPRINT_BOARD === "true";

// ---- App-wide focus ---------------------------------------------------------
// VITE_SPRINT_FOCUS limits which sprints' *screens* the app exposes while one
// sprint is being tested. Unset / blank / "all" = no limiting (the default, so
// builds are unaffected); "1" = only Sprint 1 screens; "1,2" = Sprints 1 and 2.
// Routes, components and data stay in place — hidden screens are simply not
// rendered or linked, so removing the variable restores everything.

export const parseSprintFocus = (
  raw: string | undefined
): ReadonlySet<number> | null => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "" || value === "all") return null;
  return new Set(
    value
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((n) => Number.isInteger(n))
  );
};

export const getSprintFocus = (): ReadonlySet<number> | null =>
  parseSprintFocus(import.meta.env.VITE_SPRINT_FOCUS);

export const isSprintShown = (
  sprint: RouteSprint | null,
  focus: ReadonlySet<number> | null = getSprintFocus()
): boolean => {
  if (!focus || sprint === null) return true;
  return sprint !== "unassigned" && focus.has(sprint);
};

export const isPathVisible = (
  pathname: string,
  focus: ReadonlySet<number> | null = getSprintFocus()
): boolean => isSprintShown(sprintForPath(pathname), focus);

/** `path` if its screen is visible, otherwise the Sprint-1 `fallback`. */
export const resolveVisiblePath = (
  path: string,
  fallback: string,
  focus: ReadonlySet<number> | null = getSprintFocus()
): string => {
  const pathname = path.split(/[?#]/)[0];
  return isPathVisible(pathname, focus) ? path : fallback;
};
