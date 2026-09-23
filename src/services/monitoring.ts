import * as Sentry from "@sentry/react";

const TRACES_SAMPLE_RATE = 0.2;
const REPLAY_SESSION_SAMPLE_RATE = 0.1; // 10% of normal sessions
const REPLAY_ERROR_SAMPLE_RATE = 1.0; // 100% of sessions that hit an error

// The auth flows carry sensitive tokens in the query string —
// /auth/callback?code=<exchangeCode> (short-lived, single-purpose — see POST
// /auth/oauth/exchange, kept deliberately out of the OAuth redirect as a real
// access token never sitting in a URL) and /reset-password?token=<resetToken>
// (a genuine credential). Sentry attaches the page URL to every error event
// and to navigation/fetch breadcrumbs (which Session Replay also records), so
// without this a single error while one of those routes is open would ship a
// live or reusable-within-its-TTL value to a third-party service. Redact the
// sensitive params everywhere a URL can reach Sentry.
const SENSITIVE_URL_PARAM =
  /(^|[?&])((?:token|access_token|refresh_token|code|password)=)[^&#]*/gi;
export const scrubUrl = (url: string): string =>
  url.replace(SENSITIVE_URL_PARAM, "$1$2[REDACTED]");

export const initMonitoring = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || !import.meta.env.PROD) return; // no-op without a DSN, and never in dev
  Sentry.init({
    dsn,
    release: __APP_VERSION__,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: TRACES_SAMPLE_RATE,
    replaysSessionSampleRate: REPLAY_SESSION_SAMPLE_RATE,
    replaysOnErrorSampleRate: REPLAY_ERROR_SAMPLE_RATE,
    beforeSend(event) {
      if (event.request?.url) event.request.url = scrubUrl(event.request.url);
      if (typeof event.request?.query_string === "string") {
        event.request.query_string = scrubUrl(event.request.query_string);
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      const { data } = breadcrumb;
      if (data) {
        // `url` on fetch/xhr crumbs; `to`/`from` on navigation crumbs.
        for (const key of ["url", "to", "from"] as const) {
          if (typeof data[key] === "string") data[key] = scrubUrl(data[key]);
        }
      }
      return breadcrumb;
    },
  });
};

export const reportError = (error: unknown, componentStack?: string): void => {
  Sentry.captureException(
    error,
    componentStack ? { contexts: { react: { componentStack } } } : undefined
  );
};
