import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/features/auth/auth.api";
import { registerUnauthorizedHandler } from "@/services/api-client";
import { ApiError } from "@/services/api-error";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/services/token-storage";
import type { AuthUser, UserRole } from "@/types/user";

const UNAUTHORIZED_STATUS = 401;
const SESSION_RETRY_COUNT = 2;

// "loading": session not yet resolved. "error": a token exists but the session
// call kept failing for a reason other than a confirmed 401 (network/5xx) — the
// user may still be logged in, so callers should offer a retry rather than
// treating this the same as "unauthenticated".
type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, "TALENT" | "EMPLOYER">;
};

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser>;
  loginWithToken: (token: string) => Promise<AuthUser>;
  registerAccount: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
  patchUser: (partial: Partial<AuthUser>) => void;
  retrySession: () => void;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// The session is auth's own cache, not a regular feature query — kept here rather than
// in a `.queries.ts` file since AuthContext is the single place that owns writes to it.
const SESSION_KEY = ["session"];

// Only a confirmed 401 means "not logged in" — resolve to null so the caller can
// treat it as a real logout. Any other failure (network blip, 5xx) is rethrown so
// TanStack Query retries it and surfaces it as `isError` instead of a false logout.
const hydrateFromSession = async (): Promise<AuthUser | null> => {
  try {
    return await authApi.getSession();
  } catch (err) {
    if (err instanceof ApiError && err.status === UNAUTHORIZED_STATUS) return null;
    throw err;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => !!getAccessToken());

  const sessionQuery = useQuery({
    queryKey: SESSION_KEY,
    queryFn: hydrateFromSession,
    enabled: hasToken,
    staleTime: Infinity,
    retry: SESSION_RETRY_COUNT,
  });

  const user = sessionQuery.data ?? null;
  const status: AuthStatus = !hasToken
    ? "unauthenticated"
    : sessionQuery.isLoading
      ? "loading"
      : user
        ? "authenticated"
        : sessionQuery.isError
          ? "error"
          : "unauthenticated";

  const retrySession = useCallback(() => {
    void sessionQuery.refetch();
  }, [sessionQuery]);

  useEffect(
    () =>
      registerUnauthorizedHandler(() => {
        queryClient.setQueryData(SESSION_KEY, null);
        setHasToken(false);
      }),
    [queryClient]
  );

  const loginWithToken = useCallback(
    async (token: string, remember = true) => {
      setAccessToken(token, remember);
      try {
        const sessionUser = await hydrateFromSession();
        if (!sessionUser) throw new Error("Could not load session after authentication");
        queryClient.setQueryData(SESSION_KEY, sessionUser);
        setHasToken(true);
        return sessionUser;
      } catch (err) {
        // Establishing a brand-new session must be all-or-nothing: don't leave a
        // token persisted (and hasToken=true) if we couldn't confirm it works,
        // or every future load will silently repeat this same failure.
        clearAccessToken();
        queryClient.setQueryData(SESSION_KEY, null);
        setHasToken(false);
        throw err;
      }
    },
    [queryClient]
  );

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      const { accessToken } = await authApi.login({ email, password });
      return loginWithToken(accessToken, remember);
    },
    [loginWithToken]
  );

  const registerAccount = useCallback(
    async (input: RegisterInput) => {
      await authApi.register(input);
      return login(input.email, input.password, true);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearAccessToken();
    queryClient.setQueryData(SESSION_KEY, null);
    setHasToken(false);
  }, [queryClient]);

  const patchUser = useCallback(
    (partial: Partial<AuthUser>) => {
      queryClient.setQueryData<AuthUser | null>(SESSION_KEY, (prev) =>
        prev ? { ...prev, ...partial } : prev
      );
    },
    [queryClient]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, loginWithToken, registerAccount, logout, patchUser, retrySession }),
    [user, status, login, loginWithToken, registerAccount, logout, patchUser, retrySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
