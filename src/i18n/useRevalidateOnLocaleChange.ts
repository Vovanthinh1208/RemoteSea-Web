import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useI18n } from "@/i18n/useI18n";

/**
 * react-hook-form keeps the *rendered* validation message in its error state,
 * so an error shown before the language switch would stay in the old language.
 * When the locale changes, re-run validation for exactly the fields that are
 * currently showing an error — values, dirty/touched state and focus are
 * untouched, so nothing the user typed is lost.
 */
export const useRevalidateOnLocaleChange = <T extends FieldValues>(
  form: Pick<UseFormReturn<T>, "trigger" | "formState">
): void => {
  const { locale } = useI18n();
  const previous = useRef(locale);
  const { trigger } = form;
  const { errors } = form.formState;

  useEffect(() => {
    // Only the locale change itself should act; later `errors` updates re-run
    // this effect but exit here.
    if (previous.current === locale) return;
    previous.current = locale;
    // Errors set from an API response (setError type "server") are not
    // produced by the schema, so re-validating would silently clear them.
    const fields = Object.entries(errors)
      .filter(([, error]) => (error as { type?: string })?.type !== "server")
      .map(([field]) => field);
    if (fields.length > 0) {
      void trigger(fields as Parameters<typeof trigger>[0]);
    }
  }, [locale, trigger, errors]);
};
