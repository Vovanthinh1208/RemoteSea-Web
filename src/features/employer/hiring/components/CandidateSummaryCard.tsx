import { useState } from "react";
import { Paperclip } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { ApplicantWithJob } from "@/features/employer/employer.queries";

interface CandidateSummaryCardProps {
  applicant: ApplicantWithJob;
}

const formatSalary = (
  min: number | null,
  max: number | null,
  currency: string
): string | null => {
  if (!min && !max) return null;
  const fmt = (n: number) => `${currency} ${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max)!);
};

export const CandidateSummaryCard = ({
  applicant,
}: CandidateSummaryCardProps) => {
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const { talent } = applicant;
  const salary = formatSalary(
    talent.desiredSalaryMin,
    talent.desiredSalaryMax,
    talent.currency
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-medium text-neutral-900">
          {talent.user.name ?? "Candidate"}
        </p>
        {talent.headline && (
          <p className="mt-0.5 text-[12.5px] text-neutral-500">
            {talent.headline}
          </p>
        )}
      </div>

      <dl className="space-y-2 text-[12.5px]">
        {talent.yearsExperience != null && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">Experience</dt>
            <dd className="text-neutral-700">
              {talent.yearsExperience} yrs · {talent.level}
            </dd>
          </div>
        )}
        {salary && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">Expected salary</dt>
            <dd className="text-neutral-700">{salary}</dd>
          </div>
        )}
        {talent.country && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">Location</dt>
            <dd className="text-neutral-700">{talent.country}</dd>
          </div>
        )}
        {talent.timezone && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-400">Timezone</dt>
            <dd className="text-neutral-700">{talent.timezone}</dd>
          </div>
        )}
      </dl>

      {talent.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {talent.skills.map(({ skill }) => (
            <span
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11.5px] text-neutral-600"
              key={skill.id}
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}

      {applicant.resumeUrl && (
        <a
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full"
          )}
          href={applicant.resumeUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Paperclip size={13} /> View resume
        </a>
      )}

      {applicant.coverLetter && (
        <div>
          <button
            className="rounded-4 text-[12px] font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={() => setCoverLetterOpen((open) => !open)}
          >
            {coverLetterOpen ? "Hide cover letter" : "View cover letter"}
          </button>
          {coverLetterOpen && (
            <p className="mt-2 whitespace-pre-line rounded-10 bg-neutral-50 p-3 text-[12.5px] leading-relaxed text-neutral-600">
              {applicant.coverLetter}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
