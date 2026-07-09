import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { reportError } from "@/services/monitoring";

// A stale JS chunk (deployed while the tab was already open) throws here when the
// browser can't fetch it — the fix is a one-time reload to pick up the new build,
// not the generic "something went wrong" screen.
const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Loading chunk .* failed|dynamically imported module/i;
const CHUNK_RELOAD_FLAG = "rs_chunk_reload_attempted";

type Props = {
  children: ReactNode;
  /** When this value changes (e.g. route pathname), a previously-caught error is cleared. */
  resetKey?: string;
  /** Compact variant for boundaries scoped inside a page rather than the whole app. */
  scoped?: boolean;
};
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
    reportError(error, info.componentStack ?? undefined);

    if (CHUNK_ERROR_PATTERN.test(error.message) && !sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
      sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
      window.location.reload();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      const isChunkError = CHUNK_ERROR_PATTERN.test(this.state.error.message);
      const minHeight = this.props.scoped ? "min-h-[40vh]" : "min-h-[70vh]";

      return (
        <div className={`mx-auto flex ${minHeight} max-w-md flex-col items-center justify-center px-6 text-center`}>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {isChunkError ? "Updating…" : "Something went wrong"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {isChunkError
              ? "A new version of the app is available. Reloading…"
              : "An unexpected error occurred. Try reloading the page."}
          </p>
          {!isChunkError && (
            <Button className="mt-6" variant="primary" onClick={() => window.location.reload()}>
              Reload
            </Button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
