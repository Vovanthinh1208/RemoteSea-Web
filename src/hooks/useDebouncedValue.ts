import { useEffect, useState } from "react";

const DEBOUNCE_MS = 400;

/**
 * Returns a copy of `value` that only updates after it's stopped changing for
 * DEBOUNCE_MS — for feeding a fast-typing input into something that
 * shouldn't run on every keystroke (e.g. a server-backed search query).
 * Unlike useDebouncedSearchSync (which debounces *committing* a value to an
 * external URL/filter callback), this just returns the debounced value
 * itself, for a caller that uses it directly rather than syncing it out.
 */
export const useDebouncedValue = <T>(value: T): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  return debounced;
};
