export { apiClient, API_BASE_URL, registerUnauthorizedHandler } from "@/core/http/http-client";
export type { RequestOptions } from "@/core/http/request-config";

export { ApiError } from "@/core/errors/api-error";
export type { FieldErrors, ZodFlattenedError, ApiErrorBody } from "@/core/errors/api-error";
export {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  NetworkError,
} from "@/core/errors/error-types";
export { mapErrorToApiError } from "@/core/errors/map-error";

export type { PaginationMeta, PagedResult, PageParams } from "@/core/pagination/pagination";
export { buildPageParams } from "@/core/pagination/pagination";

export { dropUndefined, toArrayParam } from "@/core/query-params/query-params";

export {
  jobKeys,
  adminKeys,
  alertKeys,
  applicationKeys,
  employerKeys,
  salaryKeys,
  savedKeys,
  talentKeys,
  taxonomyKeys,
  sessionKeys,
} from "@/core/query/query-keys";
export { queryClient, TIER } from "@/core/query/query-client";
export { createPagedInfiniteQueryOptions } from "@/core/query/infinite-query";

export { parseOrThrow } from "@/core/validation/validate-response";

export { getAccessToken, setAccessToken, clearAccessToken } from "@/core/token/token-storage";
