import type { Sprint } from "./sprints.data";

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
