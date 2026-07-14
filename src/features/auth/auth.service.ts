import type { RequestOptions } from "@/core/http/request-config";
import { parseOrThrow } from "@/core/validation/validate-response";
import { authRepository } from "@/features/auth/auth.repository";
import { toAuthUser } from "@/features/auth/auth.mapper";
import { sessionResponseSchema } from "@/features/auth/auth.dto";
import type {
  LoginPayload,
  OAuthProvider,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/features/auth/auth.dto";
import type { AuthUser } from "@/types/user";

export type { LoginPayload, RegisterPayload, ResetPasswordPayload, OAuthProvider };

export const login = async (payload: LoginPayload): Promise<{ accessToken: string }> =>
  authRepository.login(payload);

export const register = async (
  payload: RegisterPayload
): Promise<{ id: string; email: string; name: string; role: AuthUser["role"] }> =>
  authRepository.register(payload);

export const getSession = async (opts?: RequestOptions): Promise<AuthUser | null> => {
  const dto = await authRepository.getSession(opts);
  const { user } = parseOrThrow(sessionResponseSchema, dto, "GET /auth/session");
  return user ? toAuthUser(user) : null;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> =>
  authRepository.forgotPassword(email);

export const resetPassword = async (payload: ResetPasswordPayload): Promise<{ message: string }> =>
  authRepository.resetPassword(payload);

export const oauthUrl = (provider: OAuthProvider): string => authRepository.oauthUrl(provider);
