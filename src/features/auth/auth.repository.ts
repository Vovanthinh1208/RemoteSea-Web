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
} from "@/features/auth/auth.dto";

export const authRepository = {
  login: async (payload: LoginPayload): Promise<LoginResponseDto> => {
    const { data } = await apiClient.post<LoginResponseDto>("/auth/login", payload);
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
