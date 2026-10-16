import { Tag } from "@/components/ui/tag";
import type { Skill } from "@/types/job";
import { useTranslation } from "@/i18n/useTranslation";

interface JobSkillsCardProps {
  skills: { skill: Skill }[];
}

export const JobSkillsCard = ({ skills }: JobSkillsCardProps) => {
  const { t } = useTranslation("jobs");
  if (skills.length === 0) return null;

  return (
    <div className="mb-6 rounded-16 border border-neutral-100 bg-white p-6 shadow-card">
      <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">
        {t("detail.skills")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map(({ skill }) => (
          <Tag key={skill.id}>{skill.name}</Tag>
        ))}
      </div>
    </div>
  );
};
