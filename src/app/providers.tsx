import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";

interface AppProvidersProps {
  children: React.ReactNode;
}

const QUERY_STALE_TIME_MS = 60_000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      // api-client.ts's response interceptor already retries retryable GETs
      // (network errors / 5xx) with backoff before ever rejecting — a second
      // retry layer here would compound into up to 6 attempts per query and
      // would also blindly retry non-retryable errors (404s, etc.) that the
      // interceptor correctly leaves alone.
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders = ({ children }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
