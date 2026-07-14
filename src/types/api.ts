// Compat shim — these types now live in src/core (errors/api-error.ts, pagination/pagination.ts).
// Kept so existing imports of "@/types/api" keep working unchanged.
export type { FieldErrors, ZodFlattenedError, ApiErrorBody } from "@/core/errors/api-error";
export type { PaginationMeta } from "@/core/pagination/pagination";
