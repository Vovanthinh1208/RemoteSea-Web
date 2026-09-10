import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  Clock,
  Code2,
  FileText,
  FolderPlus,
  GraduationCap,
  Globe,
  Globe2,
  Mail,
  MapPin,
  Send,
  Settings,
  ShieldCheck,
  User,
  UserX,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GradientInitial } from "@/components/ui/gradient-initial";
import { CompanyLogo } from "@/components/ui/company-logo";
import { AvailabilityBadge } from "@/features/availability/AvailabilityBadge";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
import { usePublicTalentProfile } from "@/features/talent/talent.queries";
import { useAuth } from "@/contexts/AuthContext";
import { LEVEL_TO_LABEL } from "@/features/talent/talent.constants";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { safeExternalUrl } from "@/utils/safe-url";
import {
  formatDuration,
  formatMonthYear,
  formatSalaryRange,
} from "@/utils/format";
import { personInitial } from "@/utils/name";
import { ROUTES } from "@/constants/routes";
import type { EmploymentType, TimezoneOverlap } from "@/types/talent";
import type { WorkExperience } from "@/types/work-experience";

const MOCK_RECRUITER = {
  company: "Finch Labs",
  roleTitle: "Senior Full-stack Engineer",
};
const MOCK_MATCH_SCORE = 94;

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  CONTRACT: "Contract",
  PART_TIME: "Part-time",
};

const HOURS_OVERLAP_LABELS: Record<TimezoneOverlap, string> = {
  SG_HOURS: "SG",
  AU_HOURS: "AU",
  ASYNC_ONLY: "async",
};

const TALENT_REVIEW_CATEGORIES = [
  { key: "communication", label: "Communication" },
  { key: "professionalism", label: "Professionalism" },
  { key: "reliability", label: "Reliability" },
] as const;

// Mirrors the real page's actual shape (hero card, main-column sections,
// sidebar cards) rather than one flat block — so the content that pops in a
// moment later doesn't shift the page around it (same reasoning as
// TalentDashboardSkeleton).
const ProfileSkeleton = () => (
  <div className="mx-auto max-w-[1200px] px-6 py-10">
    <div className="mb-6 grid gap-6 rounded-24 border border-neutral-100 bg-white p-8 lg:grid-cols-[auto_1fr_auto]">
      <Skeleton className="h-20 w-20 flex-shrink-0 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-16 lg:w-[200px]" />
    </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <Skeleton className="h-40 rounded-20" />
        <Skeleton className="h-52 rounded-20" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-20" />
        <Skeleton className="h-28 rounded-20" />
      </div>
    </div>
  </div>
);

export const PublicTalentProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isRecruiterPreview = searchParams.get("preview") === "recruiter";
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = usePublicTalentProfile(slug);
  useDocumentTitle(
    profile?.user?.name
      ? `${profile.user.name} — Talent Profile`
      : "Talent Profile"
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400">
          <UserX size={20} />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Profile not found
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          This talent profile doesn&apos;t exist or was removed.
        </p>
        <Link className="mt-6" to={ROUTES.jobs}>
          <Button variant="primary">Browse jobs</Button>
        </Link>
      </div>
    );
  }

  const name = profile.user?.name ?? "RemoteSEA member";
  const isOwnProfile = !!user && profile.userId === user.id;

  const employmentLabel = profile.employmentTypes.length
    ? profile.employmentTypes.map((t) => EMPLOYMENT_LABELS[t]).join(", ")
    : "Not specified";
  const hoursOverlapLabel = profile.timezoneOverlap.length
    ? profile.timezoneOverlap.map((t) => HOURS_OVERLAP_LABELS[t]).join(" / ")
    : "Not specified";
  const remoteLevel = profile.timezoneOverlap.includes("ASYNC_ONLY")
    ? "Remote · Async-first"
    : "Remote";
  const topSkillsLine = profile.skills
    .slice(0, 3)
    .map((s) => s.skill.name)
    .join(" + ");

  const portfolioHighlights = profile.profileHighlights.filter(
    (h) => h.type === "PORTFOLIO"
  );
  const educationHighlights = profile.profileHighlights.filter(
    (h) => h.type === "EDUCATION"
  );
  const languageHighlights = profile.profileHighlights.filter(
    (h) => h.type === "LANGUAGE"
  );
  const hasQuickFacts =
    !!profile.noticePeriod ||
    profile.employmentTypes.length > 0 ||
    profile.timezoneOverlap.length > 0 ||
    !!profile.rightToWork;

  // Each href is user-supplied and only backend-validated with Zod .url(),
  // which accepts javascript:/data: — safeExternalUrl drops anything that
  // isn't http(s)/mailto so a malicious link can't reach the <a href> below.
  const links = [
    {
      icon: Code2,
      label: profile.githubUrl,
      href: safeExternalUrl(profile.githubUrl),
    },
    {
      icon: User,
      label: profile.linkedinUrl,
      href: safeExternalUrl(profile.linkedinUrl),
    },
    {
      icon: Globe,
      label: profile.portfolioUrl,
      href: safeExternalUrl(profile.portfolioUrl),
    },
    {
      icon: FileText,
      label: "Resume / CV",
      href: safeExternalUrl(profile.resumeUrl),
    },
  ].filter((l): l is { icon: typeof Code2; label: string; href: string } =>
    Boolean(l.href && l.label)
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        {isRecruiterPreview && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-20 border border-brand-100 bg-brand-50 p-5">
            <div className="flex items-center gap-3">
              <CompanyLogo name={MOCK_RECRUITER.company} size={36} />
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500">
                  Viewing as recruiter · {MOCK_RECRUITER.company}
                </p>
                <p className="text-[13px] text-neutral-700">
                  Hiring for {MOCK_RECRUITER.roleTitle}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[22px] font-semibold leading-none text-brand-700">
                {MOCK_MATCH_SCORE}
              </p>
              <p className="text-[11px] text-neutral-500">Profile match</p>
              {topSkillsLine && (
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  {topSkillsLine}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 rounded-10 border border-neutral-200 bg-white px-3 py-2 text-[12.5px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
              >
                <FolderPlus size={13} /> Add to shortlist
              </button>
              <button
                className="flex items-center gap-1.5 rounded-10 border border-neutral-200 bg-white px-3 py-2 text-[12.5px] font-medium text-neutral-600 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
              >
                <Bookmark size={13} /> Save
              </button>
              <button
                className="flex items-center gap-1.5 rounded-10 bg-brand-600 px-3 py-2 text-[12.5px] font-medium text-white hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
                type="button"
              >
                <Send size={13} /> Send message
              </button>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="mb-6 grid gap-6 rounded-24 border border-neutral-100 bg-white p-8 lg:grid-cols-[auto_1fr_auto]">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <GradientInitial className="h-20 w-20 rounded-full text-[26px]">
                {personInitial(name)}
              </GradientInitial>
              {profile.isOpenToWork && (
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500" />
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11.5px] font-medium text-neutral-600">
                  <ShieldCheck className="text-brand-600" size={11} /> Verified
                </span>
              )}
              <AvailabilityBadge
                isOpenToWork={profile.isOpenToWork}
                noticePeriod={profile.noticePeriod}
              />
            </div>
            <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
              {name}
            </h1>
            {profile.headline && (
              <p className="mb-3 text-[16px] text-neutral-500">
                {profile.headline}
              </p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {profile.location && (
                <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                  <MapPin
                    className="flex-shrink-0 text-neutral-400"
                    size={12}
                  />
                  {profile.location}
                </span>
              )}
              {profile.timezone && (
                <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                  <Clock className="flex-shrink-0 text-neutral-400" size={12} />
                  {profile.timezone}
                </span>
              )}
              {profile.yearsExperience !== null && (
                <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                  <Briefcase
                    className="flex-shrink-0 text-neutral-400"
                    size={12}
                  />
                  {profile.yearsExperience}+ yrs experience
                </span>
              )}
              {/* No icon here — ShieldCheck is already the page's
                  "Verified" badge above; reusing it for seniority level
                  gave the same glyph two unrelated meanings on one screen,
                  and no other icon in this row's set means "level" without
                  being just as arbitrary. */}
              <span className="text-[13px] text-neutral-500">
                {LEVEL_TO_LABEL[profile.level] ?? profile.level}
              </span>
              {isRecruiterPreview && (
                <>
                  <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                    <Zap className="flex-shrink-0 text-neutral-400" size={12} />
                    Replies in ~6h
                  </span>
                  <span className="text-[13px] text-neutral-500">
                    Active today
                  </span>
                </>
              )}
            </div>
          </div>

          {profile.desiredSalaryMin && profile.desiredSalaryMax && (
            <div className="min-w-[200px] rounded-16 border border-neutral-100 bg-neutral-50 p-5">
              <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                Expecting
              </p>
              <p className="text-[26px] font-semibold leading-tight tracking-tight text-neutral-900">
                {formatSalaryRange(
                  profile.desiredSalaryMin,
                  profile.desiredSalaryMax
                )}
                <span className="ml-1 text-[14px] font-normal text-neutral-400">
                  {" "}
                  / mo
                </span>
              </p>
              <p className="text-[12px] text-neutral-500">{profile.currency}</p>
              {isRecruiterPreview && (
                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full w-2/3 rounded-full bg-brand-500" />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                    <span>VN median</span>
                    <span>SG market</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <ReviewsSection
              categories={TALENT_REVIEW_CATEGORIES}
              userId={profile.userId}
            />

            {profile.bio && (
              <section className="rounded-20 border border-neutral-100 bg-white p-7">
                <h2 className="mb-4 text-[17px] font-semibold text-neutral-900">
                  About
                </h2>
                <p className="text-[14px] leading-relaxed text-neutral-600">
                  {profile.bio}
                </p>
                {isRecruiterPreview && (
                  <div className="mt-4 rounded-12 border-l-2 border-brand-500 bg-neutral-50 p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      What I&apos;m looking for
                    </p>
                    <ul className="grid gap-1.5 text-[13px] text-neutral-700 sm:grid-cols-2">
                      <li className="flex items-center gap-1.5">
                        <span className="text-brand-600">✓</span> Senior or
                        Staff title — IC track
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-brand-600">✓</span> Async-first or{" "}
                        {profile.timezone ?? "flexible"} hours
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-brand-600">✓</span> Small team
                      </li>
                      {profile.desiredSalaryMin && profile.desiredSalaryMax && (
                        <li className="flex items-center gap-1.5">
                          <span className="text-brand-600">✓</span>{" "}
                          {formatSalaryRange(
                            profile.desiredSalaryMin,
                            profile.desiredSalaryMax
                          )}{" "}
                          {profile.currency} / month
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {profile.workExperiences.length > 0 && (
              <section className="rounded-20 border border-neutral-100 bg-white p-7">
                <h2 className="mb-5 text-[17px] font-semibold text-neutral-900">
                  Experience
                </h2>
                <div className="divide-y divide-neutral-50">
                  {profile.workExperiences.map((experience: WorkExperience) => (
                    <div
                      className="flex gap-4 py-4 first:pt-0"
                      key={experience.id}
                    >
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
                            {formatDuration(
                              experience.startDate,
                              experience.endDate
                            )}
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
            )}

            {profile.skills.length > 0 && (
              <section className="rounded-20 border border-neutral-100 bg-white p-7">
                <h2 className="mb-5 text-[17px] font-semibold text-neutral-900">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(({ skill, yearsExp }) => (
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

            {!profile.bio &&
              profile.skills.length === 0 &&
              profile.workExperiences.length === 0 &&
              profile.profileHighlights.length === 0 && (
                <section className="rounded-20 border border-neutral-100 bg-white p-7 text-center text-[13px] text-neutral-400">
                  This member hasn&apos;t filled out their profile yet.
                </section>
              )}
          </div>

          <aside className="space-y-4">
            <div className="space-y-4 lg:sticky lg:top-6">
              {hasQuickFacts && (
                <div className="rounded-20 border border-neutral-100 bg-white p-5">
                  <h4 className="mb-3 text-[13px] font-semibold text-neutral-800">
                    Quick facts
                  </h4>
                  <dl className="space-y-2.5 text-[12.5px]">
                    {profile.noticePeriod && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-neutral-500">Notice period</dt>
                        <dd className="font-medium text-neutral-800">
                          {profile.noticePeriod}
                        </dd>
                      </div>
                    )}
                    {profile.employmentTypes.length > 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-neutral-500">Employment</dt>
                        <dd className="text-right font-medium text-neutral-800">
                          {employmentLabel}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-neutral-500">Remote level</dt>
                      <dd className="font-medium text-neutral-800">
                        {remoteLevel}
                      </dd>
                    </div>
                    {profile.timezoneOverlap.length > 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-neutral-500">Hours overlap</dt>
                        <dd className="font-mono text-[11.5px] font-medium text-neutral-800">
                          {hoursOverlapLabel}
                        </dd>
                      </div>
                    )}
                    {/* One row, not two — "Open to relocation" used to
                        render right below this as a derived Yes/No from
                        the exact same field, but that collapsed 3 of the 4
                        real RightToWork values ("Vietnam only"/"+
                        Singapore"/"+ Australia") down to an indistinguishable
                        "No," losing information the raw value already
                        states more precisely. */}
                    {profile.rightToWork && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-neutral-500">Right to work</dt>
                        <dd className="text-right font-medium text-neutral-800">
                          {profile.rightToWork}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {languageHighlights.length > 0 && (
                <div className="rounded-20 border border-neutral-100 bg-white p-5">
                  <h4 className="mb-3 text-[13px] font-semibold text-neutral-800">
                    Languages
                  </h4>
                  <div className="space-y-2.5">
                    {languageHighlights.map((lang) => (
                      <div
                        className="flex items-center gap-2.5 text-[12.5px]"
                        key={lang.id}
                      >
                        <Globe2
                          className="flex-shrink-0 text-neutral-400"
                          size={14}
                        />
                        <div>
                          <p className="font-medium text-neutral-800">
                            {lang.title}
                          </p>
                          {lang.subtitle && (
                            <p className="text-[11px] text-neutral-400">
                              {lang.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {links.length > 0 && (
                <div className="rounded-20 border border-neutral-100 bg-white p-5">
                  <h4 className="mb-3 text-[13px] font-semibold text-neutral-800">
                    Links
                  </h4>
                  <div className="space-y-1.5">
                    {links.map((l) => (
                      <a
                        className="flex items-center gap-2.5 rounded-10 px-2 py-1.5 text-[13px] text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
                        href={l.href}
                        key={l.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <l.icon
                          className="flex-shrink-0 text-neutral-400"
                          size={14}
                        />
                        <span className="flex-1 truncate">{l.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {isRecruiterPreview && (
                <div className="rounded-20 border border-neutral-100 bg-white p-5">
                  <h4 className="mb-3 text-[13px] font-semibold text-neutral-800">
                    Trust signals
                  </h4>
                  <div className="space-y-2.5 text-[12.5px]">
                    <div className="flex items-center gap-2">
                      {profile.isVerified ? (
                        <ShieldCheck
                          className="flex-shrink-0 text-brand-600"
                          size={14}
                        />
                      ) : (
                        <Mail
                          className="flex-shrink-0 text-neutral-300"
                          size={14}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-800">
                          {profile.isVerified
                            ? "Email verified"
                            : "Email not verified"}
                        </p>
                        {isOwnProfile && user && profile.isVerified && (
                          <p className="truncate text-[11px] text-neutral-400">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className="flex-shrink-0 text-brand-600"
                        size={14}
                      />
                      <p className="font-medium text-neutral-800">
                        Employment verified{" "}
                        <span className="font-normal text-neutral-400">
                          · {profile.workExperiences.length} of{" "}
                          {profile.workExperiences.length} roles
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail
                        className="flex-shrink-0 text-neutral-300"
                        size={14}
                      />
                      <div>
                        <p className="font-medium text-neutral-800">
                          ID verified
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Not yet uploaded
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isOwnProfile && (
                <Link
                  className="flex items-center justify-center gap-1.5 rounded-12 border border-neutral-200 bg-white py-2.5 text-[12.5px] font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
                  to={ROUTES.profile}
                >
                  <Settings size={12} /> This is your profile · Edit
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
