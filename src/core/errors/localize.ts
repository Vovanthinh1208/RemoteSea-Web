import { ApiError } from "@/core/errors/api-error";
import { getRuntimeLocale, translate } from "@/i18n/runtime";
import { hasTranslation } from "@/i18n/translate";

const STATUS_KEYS = new Set([400, 401, 403, 404, 409, 422, 429]);

// Backend error codes are an open set: an unknown code is expected and falls
// through to the status-based message, so probe instead of translating.
const lookup = (key: string): string | null =>
  hasTranslation("en", key) || hasTranslation(getRuntimeLocale(), key)
    ? translate(key)
    : null;

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
