import type { CategoryDto, SkillDto } from "@/features/taxonomy/taxonomy.dto";
import type { Category, Skill } from "@/types/job";

export const toCategory = (dto: CategoryDto): Category => dto;
export const toSkill = (dto: SkillDto): Skill => dto;
