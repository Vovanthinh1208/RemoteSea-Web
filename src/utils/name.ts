/**
 * The avatar initial for a person's name — the first letter of the last
 * whitespace-separated word, which for Vietnamese names (given name last, e.g.
 * "Trần Minh" → "M") is the given-name initial. Was hand-rolled in two places
 * that had already drifted (one uppercased and fell back to "C", the other did
 * neither and fell back "?").
 */
export const personInitial = (name: string | null | undefined): string => {
  const last = name?.trim().split(/\s+/).pop();
  return last?.[0]?.toUpperCase() ?? "?";
};
