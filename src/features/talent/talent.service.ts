import type { RequestOptions } from "@/core/http/request-config";
import { talentRepository } from "@/features/talent/talent.repository";
import { toTalentProfile } from "@/features/talent/talent.mapper";
import type {
  ProfileViewAnalyticsDto,
  UpdateTalentProfileRequestDto,
} from "@/features/talent/talent.dto";
import type { TalentProfile } from "@/types/talent";

export const getMyTalentProfile = async (
  opts?: RequestOptions
): Promise<TalentProfile> =>
  toTalentProfile(await talentRepository.getMine(opts));

export const updateMyTalentProfile = async (
  payload: UpdateTalentProfileRequestDto
): Promise<TalentProfile> =>
  toTalentProfile(await talentRepository.updateMine(payload));

export const getPublicTalentProfile = async (
  slug: string,
  opts?: RequestOptions
): Promise<TalentProfile> =>
  toTalentProfile(await talentRepository.getPublic(slug, opts));

export const submitTalentVerification = async (
  email: string
): Promise<{ message: string }> =>
  talentRepository.submitVerification({ email });

export const confirmTalentVerification = async (
  token: string
): Promise<{ message: string }> =>
  talentRepository.confirmVerification({ token });

export const getProfileViewAnalytics = async (
  opts?: RequestOptions
): Promise<ProfileViewAnalyticsDto> =>
  talentRepository.getProfileViewAnalytics(opts);
