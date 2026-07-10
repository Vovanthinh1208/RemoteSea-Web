import { ApiError } from "@/core/errors/api-error";

/** Server-side 400/422 validation failure, or a client-side response-shape mismatch (see validate-response.ts). */
export class ValidationError extends ApiError {
  constructor(status: number, body: unknown) {
    super(status, body);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(status: number, body: unknown) {
    super(status, body);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(status: number, body: unknown) {
    super(status, body);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(status: number, body: unknown) {
    super(status, body);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(status: number, body: unknown) {
    super(status, body);
    this.name = "ConflictError";
  }
}

/** No response was received at all (offline, timeout, DNS failure, CORS, ...). */
export class NetworkError extends ApiError {
  constructor(body: unknown) {
    super(0, body);
    this.name = "NetworkError";
  }
}
