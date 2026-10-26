import { Link, useParams } from "react-router-dom";
import {
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Settings,
  Timer,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { CompanyLogo } from "@/components/ui/company-logo";
import { VerifiedInline } from "@/components/shared/VerifiedInline";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobCardSkeleton } from "@/features/jobs/components/JobCardSkeleton";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
import { usePublicCompanyProfile } from "@/features/employer/employer.queries";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { safeExternalUrl } from "@/utils/safe-url";
import { formatResponseTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";
import { translate } from "@/i18n/runtime";
import { formatLocalDate } from "@/utils/format";

const JOB_LIST_SKELETON_COUNT = 3;

// A company's incoming reviews are always TALENT_TO_EMPLOYER (see
// ReviewForm's identical direction split) — communication/interviewProcess/
// professionalism, never reliability.
const EMPLOYER_REVIEW_KEYS = [
  "communication",
  "interviewProcess",
  "professionalism",
] as const;

const companyMetaDescription = (
  profile: NonNullable<ReturnType<typeof usePublicCompanyProfile>["data"]>
): string => {
  const jobsLine =
    profile.activeJobCount > 0
      ? translate("employer.company.metaJobs", {
          count: profile.activeJobCount,
        })
      : "";
  return translate("employer.company.meta", {
    name: profile.companyName,
    industry: profile.industry ? ` — ${profile.industry}` : "",
    jobs: jobsLine,
  });
};

export const CompanyProfilePage = () => {
  const { t } = useTranslation("employer");
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = usePublicCompanyProfile(slug);
  useDocumentTitle(
    profile
      ? t("company.docTitle", { name: profile.companyName })
      : t("company.docTitleFallback"),
    profile ? companyMetaDescription(profile) : undefined
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-[1200px] px-6 py-10">
          {/* Mirrors the loaded layout below (hero + list + sidebar) rather
              than one generic block, so the page doesn't visibly jump once
              data arrives. */}
          <div className="mb-6 flex flex-col gap-6 rounded-24 border border-neutral-100 bg-white p-8 sm:flex-row sm:items-start">
            <Skeleton className="h-[72px] w-[72px] flex-shrink-0 rounded-16" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-2/3 max-w-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: JOB_LIST_SKELETON_COUNT }, (_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
            <Skeleton className="h-48 w-full rounded-20" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {t("company.notFound")}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {t("company.notFoundDesc")}
        </p>
        <Link className="mt-6" to={ROUTES.jobs}>
          <Button variant="primary">{t("company.browseJobs")}</Button>
        </Link>
      </div>
    );
  }

  const isOwnProfile = !!user && profile.userId === user.id;
  const location = [profile.hqCity, profile.hqCountry]
    .filter(Boolean)
    .join(", ");
  const websiteHref = safeExternalUrl(profile.websiteUrl);
  // PB31/PB33 company settings — each link only renders when it's a safe
  // http(s) URL.
  const socialLinks = [
    {
      href: safeExternalUrl(profile.linkedinUrl),
      label: t("company.linkedin"),
    },
    {
      href: safeExternalUrl(profile.facebookUrl),
      label: t("company.facebook"),
    },
    { href: safeExternalUrl(profile.videoUrl), label: t("company.video") },
  ].filter((l): l is { href: string; label: string } => !!l.href);
  const coverHref = safeExternalUrl(profile.coverImageUrl);
  const logoHref = safeExternalUrl(profile.logoUrl);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        {/* Hero — PB33 AC2: cover image, logo, name, badge, intro, size,
            location. */}
        <div className="mb-6 overflow-hidden rounded-24 border border-neutral-100 bg-white">
          {coverHref && (
            <img
              alt=""
              className="h-36 w-full object-cover sm:h-52"
              src={coverHref}
            />
          )}
          <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-start">
            {logoHref ? (
              <img
                alt={t("company.logoAlt", { name: profile.companyName })}
                className="h-[72px] w-[72px] flex-shrink-0 rounded-16 border border-neutral-100 bg-white object-contain"
                src={logoHref}
              />
            ) : (
              <CompanyLogo name={profile.companyName} size={72} />
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">
                  {profile.companyName}
                </h1>
                {profile.isVerified && <VerifiedInline iconSize={14} />}
              </div>
              {profile.description && (
                <p className="mb-3 max-w-2xl text-[14px] leading-relaxed text-neutral-500">
                  {profile.description}
                </p>
              )}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {location && (
                  <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                    <MapPin
                      className="flex-shrink-0 text-neutral-400"
                      size={12}
                    />
                    {location}
                  </span>
                )}
                {profile.industry && (
                  <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                    <Building2
                      className="flex-shrink-0 text-neutral-400"
                      size={12}
                    />
                    {profile.industry}
                  </span>
                )}
                {profile.size && (
                  <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                    <Users
                      className="flex-shrink-0 text-neutral-400"
                      size={12}
                    />
                    {t("company.employees", { size: profile.size })}
                  </span>
                )}
                {profile.founded && (
                  <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                    <Calendar
                      className="flex-shrink-0 text-neutral-400"
                      size={12}
                    />
                    {t("company.founded", { year: profile.founded })}
                  </span>
                )}
                {websiteHref && (
                  <a
                    className="flex items-center gap-1.5 text-[13px] text-brand-600 transition-colors hover:text-brand-700"
                    href={websiteHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Globe className="flex-shrink-0" size={12} />
                    {t("company.website")}
                  </a>
                )}
                {socialLinks.map((link) => (
                  <a
                    className="flex items-center gap-1.5 text-[13px] text-brand-600 transition-colors hover:text-brand-700"
                    href={link.href}
                    key={link.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="flex-shrink-0" size={12} />
                    {link.label}
                  </a>
                ))}
              </div>
              {profile.hqAddress && (
                <p className="mt-2 flex items-start gap-1.5 text-[13px] text-neutral-500 [overflow-wrap:anywhere]">
                  <MapPin
                    className="mt-0.5 flex-shrink-0 text-neutral-400"
                    size={12}
                  />
                  {profile.hqAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {profile.benefits.length > 0 && (
          <section className="mb-6 rounded-20 border border-neutral-100 bg-white p-5">
            <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">
              {t("company.benefits")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {profile.benefits.map((b) => (
                <li
                  className="text-brand-800 rounded-full bg-brand-50 px-3 py-1 text-[12.5px]"
                  key={b}
                >
                  {b}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <h2 className="text-[17px] font-semibold text-neutral-900">
              {t("company.openPositions")}
              <span className="font-normal text-neutral-400">
                ({profile.activeJobCount})
              </span>
            </h2>
            {profile.jobs.length === 0 ? (
              <EmptyState
                className="rounded-20 border border-neutral-100 bg-white py-14"
                description={t("company.checkBack")}
                title={t("company.noRoles")}
              />
            ) : (
              <div className="space-y-3">
                {profile.jobs.map((job) => (
                  <JobCard job={job} key={job.id} />
                ))}
              </div>
            )}

            <ReviewsSection
              categories={EMPLOYER_REVIEW_KEYS.map((key) => ({
                key,
                label: t(`company.review.${key}`),
              }))}
              userId={profile.userId}
            />
          </div>

          <aside className="space-y-4">
            <div className="space-y-4 lg:sticky lg:top-6">
              <div className="rounded-20 border border-neutral-100 bg-white p-5">
                <h4 className="mb-3 text-[13px] font-semibold text-neutral-800">
                  {t("company.quickFacts")}
                </h4>
                <dl className="space-y-2.5 text-[12.5px]">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-neutral-500">
                      {t("company.openRoles")}
                    </dt>
                    <dd className="font-medium text-neutral-800">
                      {profile.activeJobCount}
                    </dd>
                  </div>
                  {profile.vnHireTotal > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-neutral-500">
                        {t("company.vnHires")}
                      </dt>
                      <dd className="font-medium text-neutral-800">
                        {profile.vnHireTotal}
                      </dd>
                    </div>
                  )}
                  {profile.avgFirstResponseHours != null && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-1.5 text-neutral-500">
                        <Timer size={11} /> {t("company.typicalResponse")}
                      </dt>
                      <dd className="font-medium text-neutral-800">
                        {formatResponseTime(profile.avgFirstResponseHours)}
                      </dd>
                    </div>
                  )}
                  {profile.isVerified && profile.verifiedAt && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-neutral-500">
                        {t("company.verifiedSince")}
                      </dt>
                      <dd className="font-medium text-neutral-800">
                        {formatLocalDate(profile.verifiedAt, {
                          month: "short",
                          year: "numeric",
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {isOwnProfile && (
                <Link
                  className="flex items-center justify-center gap-1.5 rounded-12 border border-neutral-200 bg-white py-2.5 text-[12.5px] font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
                  to={ROUTES.companySettings}
                >
                  <Settings size={12} /> {t("company.yourCompany")}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
