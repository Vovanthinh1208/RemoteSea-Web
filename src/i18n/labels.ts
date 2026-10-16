import { translate } from "@/i18n/runtime";

/** "Principal / Lead" -> "principal_lead", "UTC+7 (Hanoi)" -> "utc_7_hanoi" */
export const valueSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/**
 * Display label for a stable domain value (the value itself — what the API and
 * URLs carry — never changes). Looks up `<prefix>.<slug(value)>` in the active
 * locale and falls back to the raw value when no label is defined, so unknown
 * values from the backend still render instead of showing a key.
 */
export const optionLabel = (prefix: string, value: string): string => {
  const key = `${prefix}.${valueSlug(value)}`;
  const text = translate(key);
  return text === key ? value : text;
};
