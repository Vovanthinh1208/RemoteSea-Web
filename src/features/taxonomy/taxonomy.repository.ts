import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  CategoryDto,
  SkillDto,
} from "@/features/taxonomy/taxonomy.dto";

export const taxonomyRepository = {
  listCategories: async (
    opts?: RequestOptions
  ): Promise<CategoryDto[]> => {
    const { data } = await apiClient.get<CategoryDto[]>(
      "/categories",
      { signal: opts?.signal }
    );
    return data;
  },

  listSkills: async (
    q?: string,
    opts?: RequestOptions
  ): Promise<SkillDto[]> => {
    const { data } = await apiClient.get<SkillDto[]>("/skills", {
      params: q ? { q } : undefined,
      signal: opts?.signal,
    });
    return data;
  },
};
