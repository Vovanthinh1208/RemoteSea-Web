import { formatSalaryRange } from "@/utils/format";

interface PublicTalentAboutProps {
  bio: string | null;
  timezone?: string | null;
  desiredSalaryMin?: number | null;
  desiredSalaryMax?: number | null;
  currency?: string;
  isRecruiterPreview?: boolean;
}

export const PublicTalentAbout = ({
  bio,
  timezone,
  desiredSalaryMin,
  desiredSalaryMax,
  currency = "USD",
  isRecruiterPreview,
}: PublicTalentAboutProps) => {
  if (!bio) return null;

  return (
    <section className="rounded-20 border border-neutral-100 bg-white p-7">
      <h2 className="mb-4 text-[17px] font-semibold text-neutral-900">About</h2>
      <p className="text-[14px] leading-relaxed text-neutral-600">{bio}</p>
      {isRecruiterPreview && (
        <div className="mt-4 rounded-12 border-l-2 border-brand-500 bg-neutral-50 p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            What I&apos;m looking for
          </p>
          <ul className="grid gap-1.5 text-[13px] text-neutral-700 sm:grid-cols-2">
            <li className="flex items-center gap-1.5">
              <span className="text-brand-600">✓</span> Senior or Staff title —
              IC track
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-brand-600">✓</span> Async-first or{" "}
              {timezone ?? "flexible"} hours
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-brand-600">✓</span> Small team
            </li>
            {desiredSalaryMin && desiredSalaryMax && (
              <li className="flex items-center gap-1.5">
                <span className="text-brand-600">✓</span>{" "}
                {formatSalaryRange(desiredSalaryMin, desiredSalaryMax)}{" "}
                {currency} / month
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  );
};
