import generated from "./sprints.generated.json";

export interface SprintPbi {
  id: string;
  title: string;
}

export interface Sprint {
  id: number;
  name: string | null;
  /** ISO yyyy-mm-dd, from the Project Plan; null when the docs give none. */
  startDate: string | null;
  dueDate: string | null;
  pbis: SprintPbi[];
}

// Produced by scripts/generate-sprints.mjs from docs/ — never edit by hand.
export const ALL_SPRINTS: Sprint[] = generated.sprints;
