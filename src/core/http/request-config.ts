/** Passed through repository methods so React Query's queryFn signal reaches axios and actually aborts the HTTP request. */
export type RequestOptions = {
  signal?: AbortSignal;
};
