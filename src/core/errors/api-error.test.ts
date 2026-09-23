import { describe, expect, it } from "vitest";
import { ApiError, parseErrorBody } from "@/core/errors/api-error";

describe("parseErrorBody", () => {
  it("extracts a plain string error message", () => {
    expect(parseErrorBody({ error: "Email already in use" })).toEqual({
      message: "Email already in use",
    });
  });

  it("extracts message and field/form errors from a zod-flattened body", () => {
    const body = {
      error: {
        formErrors: ["Invalid submission"],
        fieldErrors: { email: ["Invalid email"] },
      },
    };
    expect(parseErrorBody(body)).toEqual({
      message: "Invalid submission",
      fieldErrors: { email: ["Invalid email"] },
      formErrors: ["Invalid submission"],
    });
  });

  it("falls back to the first field error when formErrors is empty", () => {
    const body = {
      error: {
        formErrors: [],
        fieldErrors: { email: ["Invalid email"] },
      },
    };
    expect(parseErrorBody(body).message).toBe("Invalid email");
  });

  it("falls back to a generic message for a malformed body", () => {
    expect(parseErrorBody({ nonsense: true }).message).toBe(
      "Something went wrong. Please try again."
    );
    expect(parseErrorBody(undefined).message).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("carries requestId through regardless of the error shape, for support/log correlation", () => {
    expect(
      parseErrorBody({ error: "Email already in use", requestId: "req-1" })
    ).toEqual({ message: "Email already in use", requestId: "req-1" });
    expect(parseErrorBody({ nonsense: true, requestId: "req-1" })).toEqual({
      message: "Something went wrong. Please try again.",
      requestId: "req-1",
    });
  });
});

describe("ApiError", () => {
  it("carries status, message, and field errors", () => {
    const err = new ApiError(422, {
      error: {
        formErrors: [],
        fieldErrors: { password: ["Too short"] },
      },
    });
    expect(err.status).toBe(422);
    expect(err.message).toBe("Too short");
    expect(err.fieldErrors).toEqual({ password: ["Too short"] });
    expect(err).toBeInstanceOf(Error);
  });

  it("carries requestId from the response body", () => {
    const err = new ApiError(404, {
      error: "Job not found",
      requestId: "req-1",
    });
    expect(err.requestId).toBe("req-1");
  });
});
