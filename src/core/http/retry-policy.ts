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

export const computeBackoffMs = (retryCount: number): number =>
  RETRY_BASE_DELAY_MS * 2 ** (retryCount - 1);

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
