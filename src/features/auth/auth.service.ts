import type { RequestOptions } from "@/core/http/request-config";
import { parseOrThrow } from "@/core/validation/validate-response";
import { authRepository } from "@/features/auth/auth.repository";
import { toAuthUser } from "@/features/auth/auth.mapper";
import { sessionResponseSchema } from "@/features/auth/auth.dto";
import type {
  LoginPayload,
  LoginResponseDto,
  OAuthLinkUrlDto,
  OAuthProvider,
  RegisterPayload,
  ResetPasswordPayload,
  TwoFactorChallengePayload,
  TwoFactorChallengeResponseDto,
  TwoFactorDisablePayload,
  TwoFactorSetupDto,
  TwoFactorStatusDto,
  TwoFactorVerifyPayload,
  TwoFactorVerifyResponseDto,
} from "@/features/auth/auth.dto";
import type { AuthUser } from "@/types/user";

export type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  OAuthProvider,
};

export const login = async (payload: LoginPayload): Promise<LoginResponseDto> =>
  authRepository.login(payload);

export const completeTwoFactorChallenge = async (
  payload: TwoFactorChallengePayload
): Promise<TwoFactorChallengeResponseDto> =>
  authRepository.completeTwoFactorChallenge(payload);

export const getTwoFactorStatus = async (): Promise<TwoFactorStatusDto> =>
  authRepository.getTwoFactorStatus();

export const setupTwoFactor = async (): Promise<TwoFactorSetupDto> =>
  authRepository.setupTwoFactor();

export const verifyTwoFactorSetup = async (
  payload: TwoFactorVerifyPayload
): Promise<TwoFactorVerifyResponseDto> =>
  authRepository.verifyTwoFactorSetup(payload);

export const disableTwoFactor = async (
  payload: TwoFactorDisablePayload
): Promise<{ message: string }> => authRepository.disableTwoFactor(payload);

export const register = async (
  payload: RegisterPayload
): Promise<{
  id: string;
  email: string;
  name: string;
  role: AuthUser["role"];
}> => authRepository.register(payload);

export const getSession = async (
  opts?: RequestOptions
): Promise<AuthUser | null> => {
  const dto = await authRepository.getSession(opts);
  const { user } = parseOrThrow(
    sessionResponseSchema,
    dto,
    "GET /auth/session"
  );
  return user ? toAuthUser(user) : null;
};

export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => authRepository.forgotPassword(email);

export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<{ message: string }> => authRepository.resetPassword(payload);

export const oauthUrl = (provider: OAuthProvider): string =>
  authRepository.oauthUrl(provider);

export const getOAuthLinkUrl = async (
  provider: OAuthProvider
): Promise<OAuthLinkUrlDto> => authRepository.getOAuthLinkUrl(provider);
