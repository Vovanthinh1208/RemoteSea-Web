import { GraduationCap } from "lucide-react";
import { safeExternalUrl } from "@/utils/safe-url";
import type { TalentProfile } from "@/types/talent";

interface PublicTalentHighlightsProps {
  skills: TalentProfile["skills"];
  profileHighlights: TalentProfile["profileHighlights"];
  hasBio: boolean;
  hasWorkExperiences: boolean;
}

export const PublicTalentHighlights = ({
  skills,
  profileHighlights,
  hasBio,
  hasWorkExperiences,
}: PublicTalentHighlightsProps) => {
  const portfolioHighlights = profileHighlights.filter(
    (h) => h.type === "PORTFOLIO"
  );
  const educationHighlights = profileHighlights.filter(
    (h) => h.type === "EDUCATION"
  );

  const hasAnyContent =
    hasBio ||
    skills.length > 0 ||
    hasWorkExperiences ||
    profileHighlights.length > 0;

  return (
    <>
      {skills.length > 0 && (
        <section className="rounded-20 border border-neutral-100 bg-white p-7">
          <h2 className="mb-5 text-[17px] font-semibold text-neutral-900">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(({ skill, yearsExp }) => (
              <span
                className="rounded-8 border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[12.5px] text-neutral-700"
                key={skill.id}
              >
                {skill.name}
                {yearsExp ? ` · ${yearsExp}y` : ""}
              </span>
            ))}
          </div>
        </section>
      )}

      {portfolioHighlights.length > 0 && (
        <section className="rounded-20 border border-neutral-100 bg-white p-7">
          <h2 className="mb-5 text-[17px] font-semibold text-neutral-900">
            Selected work
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {portfolioHighlights.map((work) => {
              const url = safeExternalUrl(work.url);
              const Card = url ? "a" : "div";
              return (
                <Card
                  className="block rounded-16 border border-neutral-100 p-4 transition-colors hover:border-neutral-200 focus-visible:shadow-focus focus-visible:outline-none"
                  href={url ?? undefined}
                  key={work.id}
                  rel={url ? "noopener noreferrer" : undefined}
                  target={url ? "_blank" : undefined}
                >
                  {work.tag && (
                    <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-brand-600">
                      {work.tag}
                    </p>
                  )}
                  <p className="text-[13.5px] font-semibold text-neutral-900">
                    {work.title}
                  </p>
                  {work.subtitle && (
                    <p className="mb-1.5 text-[11.5px] text-neutral-400">
                      {work.subtitle}
                    </p>
                  )}
                  {work.description && (
                    <p className="text-[12.5px] leading-relaxed text-neutral-600">
                      {work.description}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {educationHighlights.length > 0 && (
        <section className="rounded-20 border border-neutral-100 bg-white p-7">
          <h2 className="mb-5 text-[17px] font-semibold text-neutral-900">
            Education
          </h2>
          <div className="divide-y divide-neutral-50">
            {educationHighlights.map((edu) => (
              <div
                className="flex items-center gap-3 py-3 first:pt-0"
                key={edu.id}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
                  <GraduationCap size={16} />
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-neutral-900">
                    {edu.title}
                  </p>
                  <p className="text-[12px] text-neutral-500">
                    {edu.subtitle ? `${edu.subtitle} · ` : ""}
                    {edu.startYear} – {edu.endYear ?? "Present"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasAnyContent && (
        <section className="rounded-20 border border-neutral-100 bg-white p-7 text-center text-[13px] text-neutral-400">
          This member hasn&apos;t filled out their profile yet.
        </section>
      )}
    </>
  );
};
