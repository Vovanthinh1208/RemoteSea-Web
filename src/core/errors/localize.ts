import { ApiError } from "@/core/errors/api-error";
import { translate } from "@/i18n/runtime";

const STATUS_KEYS = new Set([400, 401, 403, 404, 409, 422, 429]);

// translate() returns the key itself when it has no entry
const lookup = (key: string): string | null => {
  const text = translate(key);
  return text === key ? null : text;
};

/**
 * The user-facing, localized message for any thrown value.
 *
 * Resolution order: the API's stable `code` → the HTTP status class →
 * `fallback` (an already-translated string) → a generic message. The English
 * server `message` is never shown. Per-field validation text from 400/422
 * responses is rendered next to its field by the form, not through here.
 */
export const getErrorMessage = (error: unknown, fallback?: string): string => {
  if (error instanceof ApiError) {
    if (error.status === 0) return translate("errors.network");
    const byCode = error.code ? lookup(`errors.code.${error.code}`) : null;
    if (byCode) return byCode;
    if (error.status >= 500) return translate("errors.status.5xx");
    if (STATUS_KEYS.has(error.status))
      return translate(`errors.status.${error.status}`);
  }
  return fallback ?? translate("errors.generic");
};
