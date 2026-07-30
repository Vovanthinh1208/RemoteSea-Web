import type { ZodType } from "zod";
import { ValidationError } from "@/core/errors/error-types";

/**
 * Runs a zod schema against a response body at the repository boundary. Throws a
 * ValidationError (distinguishable from a server-side 400/422 by callers that care)
 * so a client-side shape mismatch surfaces the same way a server validation error
 * does, instead of failing later with a confusing "undefined is not an object".
 *
 * Scoped to auth/billing/jobs only (see refactor plan) — not applied to every DTO,
 * since hand-derived schemas with no OpenAPI source drift from the backend over time.
 */
export const parseOrThrow = <T>(
  schema: ZodType<T>,
  data: unknown,
  context: string
): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(0, {
      error: `Invalid response shape for ${context}: ${result.error.message}`,
    });
  }
  return result.data;
};
