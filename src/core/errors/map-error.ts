import { ApiError } from "@/core/errors/api-error";
import {
  ConflictError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/core/errors/error-types";

const STATUS_TO_ERROR: Record<
  number,
  new (status: number, body: unknown) => ApiError
> = {
  400: ValidationError,
  401: UnauthorizedError,
  403: ForbiddenError,
  404: NotFoundError,
  409: ConflictError,
  422: ValidationError,
};

/** Builds the right typed ApiError subclass for a given HTTP status (or NetworkError when there is none). */
export const mapErrorToApiError = (
  status: number | undefined,
  body: unknown
): ApiError => {
  if (!status) return new NetworkError(body);
  const ErrorCtor = STATUS_TO_ERROR[status] ?? ApiError;
  return new ErrorCtor(status, body);
};
