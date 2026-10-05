import { Link } from "react-router-dom";
import {
  Code2,
  FileText,
  Globe,
  Globe2,
  Mail,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { safeExternalUrl } from "@/utils/safe-url";
import { ROUTES } from "@/constants/routes";
import type { EmploymentType, TalentProfile, TimezoneOverlap } from "@/types/talent";

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

interface PublicTalentSidebarProps {
  profile: TalentProfile;
  isRecruiterPreview?: boolean;
  isOwnProfile?: boolean;
  userEmail?: string | null;
}

export const PublicTalentSidebar = ({
  profile,
  isRecruiterPreview,
  isOwnProfile,
  userEmail,
}: PublicTalentSidebarProps) => {
  const languageHighlights = profile.profileHighlights.filter(
    (h) => h.type === "LANGUAGE"
  );

  const hasQuickFacts =
    !!profile.noticePeriod ||
    profile.employmentTypes.length > 0 ||
    profile.timezoneOverlap.length > 0 ||
    !!profile.rightToWork;

  const employmentLabel = profile.employmentTypes.length
    ? profile.employmentTypes.map((t) => EMPLOYMENT_LABELS[t]).join(", ")
    : "Not specified";

  const hoursOverlapLabel = profile.timezoneOverlap.length
    ? profile.timezoneOverlap.map((t) => HOURS_OVERLAP_LABELS[t]).join(" / ")
    : "Not specified";

  const remoteLevel = profile.timezoneOverlap.includes("ASYNC_ONLY")
    ? "Remote · Async-first"
    : "Remote";

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
                  {isOwnProfile && userEmail && profile.isVerified && (
                    <p className="truncate text-[11px] text-neutral-400">
                      {userEmail}
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
  );
};
