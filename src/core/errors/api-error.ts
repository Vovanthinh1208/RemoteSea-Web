export type FieldErrors = Record<string, string[]>;

export type ZodFlattenedError = {
  formErrors: string[];
  fieldErrors: FieldErrors;
};

export type ApiErrorBody = {
  error: string | ZodFlattenedError;
  // Present on every error response the backend itself produces (see
  // GlobalExceptionFilter) — absent only for a body that never reached it at
  // all (a network failure, or something outside this API entirely).
  requestId?: string;
};

const isZodFlattenedError = (value: unknown): value is ZodFlattenedError =>
  typeof value === "object" && value !== null && "fieldErrors" in value;

const firstFieldError = (fieldErrors: FieldErrors): string | undefined => {
  const firstKey = Object.keys(fieldErrors)[0];
  return firstKey ? fieldErrors[firstKey]?.[0] : undefined;
};

type ParsedErrorBody = {
  message: string;
  fieldErrors?: FieldErrors;
  formErrors?: string[];
  requestId?: string;
};

export const parseErrorBody = (body: unknown): ParsedErrorBody => {
  const requestId =
    body && typeof body === "object" && "requestId" in body
      ? ((body as ApiErrorBody).requestId ?? undefined)
      : undefined;

  if (body && typeof body === "object" && "error" in body) {
    const { error } = body as ApiErrorBody;
    if (typeof error === "string") return { message: error, requestId };
    if (isZodFlattenedError(error)) {
      const message =
        error.formErrors[0] ??
        firstFieldError(error.fieldErrors) ??
        "Validation failed";
      return {
        message,
        fieldErrors: error.fieldErrors,
        formErrors: error.formErrors,
        requestId,
      };
    }
  }
  return { message: "Something went wrong. Please try again.", requestId };
};

export class ApiError extends Error {
  status: number;
  fieldErrors?: FieldErrors;
  formErrors?: string[];
  // Ties this error back to the exact server-side log line — surface it in
  // a support/bug-report flow (e.g. "Error ref: {requestId}") rather than
  // asking the user to describe what happened.
  requestId?: string;

  constructor(status: number, body: unknown) {
    const parsed = parseErrorBody(body);
    super(parsed.message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = parsed.fieldErrors;
    this.formErrors = parsed.formErrors;
    this.requestId = parsed.requestId;
  }
}
