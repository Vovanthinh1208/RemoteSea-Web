import { useSearchParams } from "react-router-dom";

/**
 * A single URL query-param synced piece of state, e.g. a filter/tab/search value —
 * so it survives a refresh and can be shared/deep-linked, instead of resetting on
 * reload like a plain `useState` would. Omitting `isValid` treats any string as
 * valid (e.g. free-text search); passing it guards against a malformed/stale URL
 * ever producing an unrecognized value (e.g. a tab id).
 */
export const useSearchParamState = <T extends string>(
  key: string,
  defaultValue: T,
  isValid?: (value: string) => value is T
): [T, (next: T) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(key);
  const value =
    raw !== null && (!isValid || isValid(raw))
      ? (raw as T)
      : defaultValue;

  const setValue = (next: T) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next === defaultValue) params.delete(key);
        else params.set(key, next);
        return params;
      },
      { replace: true }
    );
  };

  return [value, setValue];
};
