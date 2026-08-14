type QueryParamValue =
  string | number | boolean | string[] | number[] | undefined;

/** Strips undefined values so axios doesn't serialize them as literal "undefined" query params. */
export const dropUndefined = <T extends Record<string, QueryParamValue>>(
  params: T
): T => {
  const result = {} as T;
  for (const key of Object.keys(params) as (keyof T)[]) {
    if (params[key] !== undefined) result[key] = params[key];
  }
  return result;
};

/** Converts an empty array to undefined so it's dropped by dropUndefined/axios instead of serialized as "". */
export const toArrayParam = <T>(values: T[]): T[] | undefined =>
  values.length ? values : undefined;
