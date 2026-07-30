import type { RequestOptions } from "@/core/http/request-config";
import { workExperienceRepository } from "@/features/talent/work-experience.repository";
import type {
  CreateWorkExperiencePayload,
  UpdateWorkExperiencePayload,
  WorkExperience,
} from "@/types/work-experience";

export const listWorkExperience = (
  opts?: RequestOptions
): Promise<WorkExperience[]> => workExperienceRepository.list(opts);

export const createWorkExperience = (
  payload: CreateWorkExperiencePayload
): Promise<WorkExperience> =>
  workExperienceRepository.create(payload);

export const updateWorkExperience = (
  id: string,
  payload: UpdateWorkExperiencePayload
): Promise<WorkExperience> =>
  workExperienceRepository.update(id, payload);

export const deleteWorkExperience = (id: string): Promise<void> =>
  workExperienceRepository.delete(id);
