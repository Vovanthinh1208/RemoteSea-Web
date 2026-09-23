import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as authService from "@/features/auth/auth.service";
import { registerUnauthorizedHandler } from "@/core/http/http-client";
import { ApiError } from "@/core/errors/api-error";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/core/token/token-storage";
import { sessionKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import { useToast } from "@/components/ui/toast";
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

// A 2FA-enabled account's login doesn't get a real session yet — the caller
// (LoginForm) must collect a code and call completeTwoFactorChallenge with
// the returned challengeToken before it gets one.
export type LoginResult =
  | { status: "success"; user: AuthUser }
  | { status: "two_factor_required"; challengeToken: string };

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<LoginResult>;
  completeTwoFactorChallenge: (
    challengeToken: string,
    code: string,
    remember?: boolean
  ) => Promise<AuthUser>;
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
const SESSION_KEY = sessionKeys.all;

// Only a confirmed 401 means "not logged in" — resolve to null so the caller can
// treat it as a real logout. Any other failure (network blip, 5xx) is rethrown so
// TanStack Query retries it and surfaces it as `isError` instead of a false logout.
const hydrateFromSession = async (): Promise<AuthUser | null> => {
  try {
    return await authService.getSession();
  } catch (err) {
    if (err instanceof ApiError && err.status === UNAUTHORIZED_STATUS)
      return null;
    throw err;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasToken, setHasToken] = useState(() => !!getAccessToken());

  const sessionQuery = useQuery({
    queryKey: SESSION_KEY,
    queryFn: hydrateFromSession,
    enabled: hasToken,
    ...TIER.session,
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

  // Depends on `refetch` (stable identity in TanStack v5), not the whole
  // `sessionQuery` result object (new every render) — with the object as the
  // dep, retrySession got a new identity each render, which re-memoized the
  // context value and re-rendered every consumer on any provider render.
  const { refetch: refetchSession } = sessionQuery;
  const retrySession = useCallback(() => {
    void refetchSession();
  }, [refetchSession]);

  useEffect(
    () =>
      registerUnauthorizedHandler(() => {
        // Only a real session expiring deserves a toast — anonymous 401s
        // (someone poking a protected endpoint logged-out) stay silent.
        const hadSession = !!getAccessToken();
        // Clear storage too (mirrors logout()) — previously the dead token
        // survived a reload and re-failed the session check every visit.
        clearAccessToken();
        queryClient.setQueryData(SESSION_KEY, null);
        setHasToken(false);
        if (hadSession) {
          toast({
            variant: "error",
            title: "Session expired",
            description: "Please sign in again to continue.",
          });
        }
      }),
    [queryClient, toast]
  );

  // Cross-tab session sync: logging out (or in) in one tab updates every other
  // tab immediately, instead of leaving them showing an authenticated UI until
  // their next request 401s. `storage` events fire only in OTHER tabs and only
  // for localStorage — sessionStorage ("don't remember me") tokens are
  // per-tab by design, so there is nothing to sync for them.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ACCESS_TOKEN_STORAGE_KEY) return;
      if (e.newValue === null) {
        queryClient.setQueryData(SESSION_KEY, null);
        setHasToken(false);
      } else {
        // A login elsewhere: mark the token present and let the session query
        // (re)fetch the user for this tab.
        setHasToken(true);
        void queryClient.invalidateQueries({ queryKey: SESSION_KEY });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [queryClient]);

  // Login/register/2FA-challenge responses already bundle the session's user
  // alongside the token — this commits both to storage/cache in one shot
  // instead of firing a follow-up GET /auth/session to learn who just signed
  // in. Unlike loginWithToken below, there's nothing to roll back on failure:
  // by the time this runs, the API call that produced `user` already
  // succeeded, so there's no partially-established session to unwind.
  const commitSession = useCallback(
    (user: AuthUser, token: string, remember: boolean) => {
      setAccessToken(token, remember);
      // flushSync, not two plain setState calls — the caller (login/2FA/
      // register forms) navigates immediately after this resolves. Without
      // forcing the commit here, that navigate() can run before React has
      // actually re-rendered with the new hasToken/session data, so the
      // destination route's ProtectedRoute reads a still-stale `user: null`
      // and bounces straight back to /login — "I signed in and got logged
      // right back out."
      flushSync(() => {
        queryClient.setQueryData(SESSION_KEY, user);
        setHasToken(true);
      });
      return user;
    },
    [queryClient]
  );

  // Only used by the OAuth callback flow: a provider redirect can only carry
  // a bare token (no room for a JSON body), so this is the one path that
  // still has to hydrate the user via GET /auth/session after the fact.
  const loginWithToken = useCallback(
    async (token: string, remember = true) => {
      setAccessToken(token, remember);
      try {
        const sessionUser = await hydrateFromSession();
        if (!sessionUser)
          throw new Error("Could not load session after authentication");
        flushSync(() => {
          queryClient.setQueryData(SESSION_KEY, sessionUser);
          setHasToken(true);
        });
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
    async (
      email: string,
      password: string,
      remember = true
    ): Promise<LoginResult> => {
      const result = await authService.login({ email, password });
      if ("twoFactorRequired" in result) {
        return {
          status: "two_factor_required",
          challengeToken: result.challengeToken,
        };
      }
      const user = commitSession(result.user, result.accessToken, remember);
      return { status: "success", user };
    },
    [commitSession]
  );

  const completeTwoFactorChallenge = useCallback(
    async (challengeToken: string, code: string, remember = true) => {
      const { accessToken, user } =
        await authService.completeTwoFactorChallenge({
          challengeToken,
          code,
        });
      return commitSession(user, accessToken, remember);
    },
    [commitSession]
  );

  const registerAccount = useCallback(
    async (input: RegisterInput) => {
      const { accessToken, user } = await authService.register(input);
      return commitSession(user, accessToken, true);
    },
    [commitSession]
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
    () => ({
      user,
      status,
      login,
      completeTwoFactorChallenge,
      loginWithToken,
      registerAccount,
      logout,
      patchUser,
      retrySession,
    }),
    [
      user,
      status,
      login,
      completeTwoFactorChallenge,
      loginWithToken,
      registerAccount,
      logout,
      patchUser,
      retrySession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
