import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  ConfirmVerificationRequestDto,
  ConfirmVerificationResponseDto,
  SubmitVerificationRequestDto,
  SubmitVerificationResponseDto,
  TalentProfileDto,
  UpdateTalentProfileRequestDto,
} from "@/features/talent/talent.dto";

export const talentRepository = {
  getMine: async (opts?: RequestOptions): Promise<TalentProfileDto> => {
    const { data } = await apiClient.get<TalentProfileDto>("/talent/me", {
      signal: opts?.signal,
    });
    return data;
  },

  updateMine: async (
    payload: UpdateTalentProfileRequestDto
  ): Promise<TalentProfileDto> => {
    const { data } = await apiClient.put<TalentProfileDto>(
      "/talent/me",
      payload
    );
    return data;
  },

  getPublic: async (
    slug: string,
    opts?: RequestOptions
  ): Promise<TalentProfileDto> => {
    const { data } = await apiClient.get<TalentProfileDto>(`/talent/${slug}`, {
      signal: opts?.signal,
    });
    return data;
  },

  submitVerification: async (
    payload: SubmitVerificationRequestDto
  ): Promise<SubmitVerificationResponseDto> => {
    const { data } = await apiClient.post<SubmitVerificationResponseDto>(
      "/talent/verification",
      payload
    );
    return data;
  },

  confirmVerification: async (
    payload: ConfirmVerificationRequestDto
  ): Promise<ConfirmVerificationResponseDto> => {
    const { data } = await apiClient.post<ConfirmVerificationResponseDto>(
      "/talent/verification/confirm",
      payload
    );
    return data;
  },
};
