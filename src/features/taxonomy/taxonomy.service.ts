import type { RequestOptions } from "@/core/http/request-config";
import { taxonomyRepository } from "@/features/taxonomy/taxonomy.repository";
import { toCategory, toSkill } from "@/features/taxonomy/taxonomy.mapper";
import type { Category, Skill } from "@/types/job";

export const listCategories = async (opts?: RequestOptions): Promise<Category[]> =>
  (await taxonomyRepository.listCategories(opts)).map(toCategory);

export const listSkills = async (q?: string, opts?: RequestOptions): Promise<Skill[]> =>
  (await taxonomyRepository.listSkills(q, opts)).map(toSkill);
