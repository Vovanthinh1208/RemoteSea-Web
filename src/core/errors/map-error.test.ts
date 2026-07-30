import { describe, expect, it } from "vitest";
import { mapErrorToApiError } from "@/core/errors/map-error";
import {
  ConflictError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/core/errors/error-types";
import { ApiError } from "@/core/errors/api-error";

describe("mapErrorToApiError", () => {
  it.each([
    [400, ValidationError],
    [401, UnauthorizedError],
    [403, ForbiddenError],
    [404, NotFoundError],
    [409, ConflictError],
    [422, ValidationError],
  ])("maps status %i to %s", (status, ErrorClass) => {
    expect(mapErrorToApiError(status, {})).toBeInstanceOf(ErrorClass);
  });

  it("maps an unmapped status to the base ApiError", () => {
    const error = mapErrorToApiError(500, {});
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
  });

  it("maps a missing status (no response) to NetworkError", () => {
    expect(mapErrorToApiError(undefined, {})).toBeInstanceOf(
      NetworkError
    );
  });
});
