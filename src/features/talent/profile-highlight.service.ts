import type { RequestOptions } from "@/core/http/request-config";
import { profileHighlightRepository } from "@/features/talent/profile-highlight.repository";
import type {
  CreateProfileHighlightPayload,
  ProfileHighlight,
  UpdateProfileHighlightPayload,
} from "@/types/profile-highlight";

export const listProfileHighlights = (
  opts?: RequestOptions
): Promise<ProfileHighlight[]> => profileHighlightRepository.list(opts);

export const createProfileHighlight = (
  payload: CreateProfileHighlightPayload
): Promise<ProfileHighlight> => profileHighlightRepository.create(payload);

export const updateProfileHighlight = (
  id: string,
  payload: UpdateProfileHighlightPayload
): Promise<ProfileHighlight> => profileHighlightRepository.update(id, payload);

export const deleteProfileHighlight = (id: string): Promise<void> =>
  profileHighlightRepository.delete(id);
