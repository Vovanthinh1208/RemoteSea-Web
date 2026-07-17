import type { InternalAxiosRequestConfig } from "axios";

export const RETRYABLE_METHOD = "get";
export const MAX_RETRIES = 2;
export const RETRY_BASE_DELAY_MS = 300;

export type RetryableConfig = InternalAxiosRequestConfig & { __retryCount?: number };

export const isRetryableError = (
  method: string | undefined,
  status: number | undefined,
  isNetworkError: boolean
): boolean =>
  method?.toLowerCase() === RETRYABLE_METHOD && (isNetworkError || (status ?? 0) >= 500);

// Exponential backoff with equal jitter (AWS "backoff and jitter"): half the
// window is fixed, half is random. Without the random half, every client that
// hit the same 5xx retries in lockstep at 300ms / 600ms and re-stampedes the
// recovering server in synchronized waves. Result stays in [base/2, base).
export const computeBackoffMs = (
  retryCount: number,
  random: () => number = Math.random
): number => {
  const window = RETRY_BASE_DELAY_MS * 2 ** (retryCount - 1);
  const half = window / 2;
  return half + Math.floor(random() * half);
};

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
