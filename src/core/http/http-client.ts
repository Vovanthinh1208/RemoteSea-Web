import axios from "axios";
import { mapErrorToApiError } from "@/core/errors/map-error";
import { clearAccessToken, getAccessToken } from "@/core/token/token-storage";
import {
  computeBackoffMs,
  isRetryableError,
  MAX_RETRIES,
  wait,
  type RetryableConfig,
} from "@/core/http/retry-policy";

const LOCAL_API_URL = "http://localhost:4000";

// Single source of truth for the API base URL — also consumed by auth's repository for the
// OAuth redirect URLs, which must point at the same host as everything else.
export const resolveApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    if (import.meta.env.PROD) {
      // A missing env var at build time would otherwise silently ship a production
      // build that talks to localhost — surface it loudly instead of failing quiet.
      console.error(
        "VITE_API_URL is not set in a production build — falling back to " +
          `${LOCAL_API_URL}, which will not work for real users.`
      );
    }
    return LOCAL_API_URL;
  }
  return url;
};

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export const registerUnauthorizedHandler = (
  handler: () => void
): (() => void) => {
  onUnauthorized = handler;
  return () => {
    if (onUnauthorized === handler) onUnauthorized = null;
  };
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    // A canceled request (React Query unmounted/refetched) is not a failure to retry —
    // retrying it would fire a redundant network call the caller already gave up on.
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isNetworkError = !error.response;

    if (isRetryableError(config?.method, status, isNetworkError) && config) {
      config.__retryCount = (config.__retryCount ?? 0) + 1;
      if (config.__retryCount <= MAX_RETRIES) {
        await wait(computeBackoffMs(config.__retryCount));
        return apiClient(config);
      }
    }

    if (status === 401) {
      clearAccessToken();
      onUnauthorized?.();
    }

    return Promise.reject(mapErrorToApiError(status, error.response?.data));
  }
);
