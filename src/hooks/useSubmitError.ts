import { useCallback, useState } from "react";
import { getErrorMessage } from "@/core/errors/localize";
import { translate } from "@/i18n/runtime";
import { useI18n } from "@/i18n/useI18n";

type SubmitErrorState =
  | { kind: "error"; error: unknown; fallbackKey?: string }
  | { kind: "key"; key: string; params?: Record<string, string | number> };

/**
 * Holds the reason a submit failed — the thrown error (or an i18n key), never a
 * pre-translated string — and resolves the message at render time. An error
 * already on screen therefore re-translates when the language switches.
 */
export const useSubmitError = () => {
  useI18n(); // subscribe: re-render (and re-resolve the message) on locale change
  const [state, setState] = useState<SubmitErrorState | null>(null);

  const fail = useCallback(
    (error: unknown, fallbackKey?: string) =>
      setState({ kind: "error", error, fallbackKey }),
    []
  );
  const failWithKey = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      setState({ kind: "key", key, params }),
    []
  );
  const clear = useCallback(() => setState(null), []);

  const message = !state
    ? null
    : state.kind === "key"
      ? translate(state.key, state.params)
      : getErrorMessage(
          state.error,
          state.fallbackKey ? translate(state.fallbackKey) : undefined
        );

  return { message, fail, failWithKey, clear };
};
