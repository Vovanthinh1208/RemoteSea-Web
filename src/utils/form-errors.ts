import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/core/errors/api-error";

export const applyServerErrors = <T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>
): void => {
  if (!error.fieldErrors) return;

  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    if (messages?.[0]) {
      setError(field as Path<T>, {
        type: "server",
        message: messages[0],
      });
    }
  }
};

/**
 * Standard form submit-failure handling: applies any field-level errors from an
 * ApiError to the form. The caller keeps the thrown error itself (see
 * useSubmitError) and shows `getErrorMessage(error)`, so the top-level message
 * is localized at render time rather than frozen into state.
 */
export const applyFormSubmitError = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): void => {
  if (error instanceof ApiError) applyServerErrors(error, setError);
};
