import { useEffect, useRef } from "react";

const SEARCH_DEBOUNCE_MS = 400;

/**
 * Debounces `search` and, once it settles, calls `onCommit(search)` — but
 * only for edits after mount (the initial value already matches
 * `currentValue`, so committing it again would be a no-op that still resets
 * `page`) and only when it actually differs from `currentValue`. Was
 * duplicated identically (down to the debounce constant) in JobsBoard and
 * TalentSearchBoard; `currentValue`/`onCommit` are read via closure when the
 * timeout fires rather than tracked as effect deps, matching both boards'
 * original behavior — e.g. the query object changing identity for an
 * unrelated reason doesn't reset the debounce timer.
 */
export const useDebouncedSearchSync = (
  search: string,
  currentValue: string,
  onCommit: (search: string) => void
) => {
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (search !== currentValue) onCommit(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
};
