import { CompanyLogo } from "@/components/ui/company-logo";
import { formatDuration, formatMonthYear } from "@/utils/format";
import type { WorkExperience } from "@/types/work-experience";

interface PublicTalentExperienceProps {
  workExperiences: WorkExperience[];
}

export const PublicTalentExperience = ({
  workExperiences,
}: PublicTalentExperienceProps) => {
  if (workExperiences.length === 0) return null;

  return (
    <section className="rounded-20 border border-neutral-100 bg-white p-7">
      <h2 className="mb-5 text-[17px] font-semibold text-neutral-900">
        Experience
      </h2>
      <div className="divide-y divide-neutral-50">
        {workExperiences.map((experience: WorkExperience) => (
          <div className="flex gap-4 py-4 first:pt-0" key={experience.id}>
            <CompanyLogo name={experience.company} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-neutral-900">
                {experience.title}{" "}
                <span className="font-normal text-neutral-500">
                  at {experience.company}
                </span>
              </p>
              <p className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-neutral-400">
                {experience.location && (
                  <>
                    <span>{experience.location}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-neutral-300" />
                  </>
                )}
                <span className="font-mono">
                  {formatMonthYear(experience.startDate)} →{" "}
                  {experience.endDate
                    ? formatMonthYear(experience.endDate)
                    : "Present"}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-neutral-300" />
                <span>
                  {formatDuration(experience.startDate, experience.endDate)}
                </span>
              </p>
              {experience.description && (
                <p className="text-[12.5px] leading-relaxed text-neutral-600">
                  {experience.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
