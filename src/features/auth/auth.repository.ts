import { apiClient, API_BASE_URL } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  LoginPayload,
  LoginResponseDto,
  OAuthProvider,
  RegisterPayload,
  RegisterResponseDto,
  ResetPasswordPayload,
  SessionResponseDto,
  TwoFactorChallengePayload,
  TwoFactorChallengeResponseDto,
  TwoFactorDisablePayload,
  TwoFactorSetupDto,
  TwoFactorStatusDto,
  TwoFactorVerifyPayload,
  TwoFactorVerifyResponseDto,
} from "@/features/auth/auth.dto";

export const authRepository = {
  login: async (payload: LoginPayload): Promise<LoginResponseDto> => {
    const { data } = await apiClient.post<LoginResponseDto>("/auth/login", payload);
    return data;
  },

  completeTwoFactorChallenge: async (
    payload: TwoFactorChallengePayload
  ): Promise<TwoFactorChallengeResponseDto> => {
    const { data } = await apiClient.post<TwoFactorChallengeResponseDto>(
      "/auth/2fa/challenge",
      payload
    );
    return data;
  },

  getTwoFactorStatus: async (): Promise<TwoFactorStatusDto> => {
    const { data } = await apiClient.get<TwoFactorStatusDto>("/auth/2fa/status");
    return data;
  },

  setupTwoFactor: async (): Promise<TwoFactorSetupDto> => {
    const { data } = await apiClient.post<TwoFactorSetupDto>("/auth/2fa/setup");
    return data;
  },

  verifyTwoFactorSetup: async (
    payload: TwoFactorVerifyPayload
  ): Promise<TwoFactorVerifyResponseDto> => {
    const { data } = await apiClient.post<TwoFactorVerifyResponseDto>("/auth/2fa/verify", payload);
    return data;
  },

  disableTwoFactor: async (payload: TwoFactorDisablePayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>("/auth/2fa/disable", payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponseDto> => {
    const { data } = await apiClient.post<RegisterResponseDto>("/auth/register", payload);
    return data;
  },

  getSession: async (opts?: RequestOptions): Promise<SessionResponseDto> => {
    const { data } = await apiClient.get<SessionResponseDto>("/auth/session", {
      signal: opts?.signal,
    });
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>("/auth/forgot-password", {
      email,
    });
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>("/auth/reset-password", payload);
    return data;
  },

  oauthUrl: (provider: OAuthProvider): string => `${API_BASE_URL}/auth/${provider}`,
};
