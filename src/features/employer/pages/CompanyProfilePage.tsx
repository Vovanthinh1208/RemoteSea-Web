import { Link, useParams } from "react-router-dom";
import {
  Building2,
  Calendar,
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

const JOB_LIST_SKELETON_COUNT = 3;

// A company's incoming reviews are always TALENT_TO_EMPLOYER (see
// ReviewForm's identical direction split) — communication/interviewProcess/
// professionalism, never reliability.
const EMPLOYER_REVIEW_CATEGORIES = [
  { key: "communication", label: "Communication" },
  { key: "interviewProcess", label: "Interview process" },
  { key: "professionalism", label: "Professionalism" },
] as const;

const companyMetaDescription = (
  profile: NonNullable<ReturnType<typeof usePublicCompanyProfile>["data"]>
): string => {
  const jobsLine =
    profile.activeJobCount > 0
      ? ` · ${profile.activeJobCount} open role${profile.activeJobCount === 1 ? "" : "s"}`
      : "";
  return `${profile.companyName}${profile.industry ? ` — ${profile.industry}` : ""}${jobsLine}. Hiring remote talent on RemoteSEA.`;
};

export const CompanyProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = usePublicCompanyProfile(slug);
  useDocumentTitle(
    profile ? `${profile.companyName} — Company Profile` : "Company Profile",
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
          Company not found
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          This company profile doesn&apos;t exist or was removed.
        </p>
        <Link className="mt-6" to={ROUTES.jobs}>
          <Button variant="primary">Browse jobs</Button>
        </Link>
      </div>
    );
  }

  const isOwnProfile = !!user && profile.userId === user.id;
  const location = [profile.hqCity, profile.hqCountry]
    .filter(Boolean)
    .join(", ");
  const websiteHref = safeExternalUrl(profile.websiteUrl);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        {/* Hero */}
        <div className="mb-6 flex flex-col gap-6 rounded-24 border border-neutral-100 bg-white p-8 sm:flex-row sm:items-start">
          <CompanyLogo name={profile.companyName} size={72} />
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
                  <Users className="flex-shrink-0 text-neutral-400" size={12} />
                  {profile.size} employees
                </span>
              )}
              {profile.founded && (
                <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                  <Calendar
                    className="flex-shrink-0 text-neutral-400"
                    size={12}
                  />
                  Founded {profile.founded}
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
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <h2 className="text-[17px] font-semibold text-neutral-900">
              Open positions{" "}
              <span className="font-normal text-neutral-400">
                ({profile.activeJobCount})
              </span>
            </h2>
            {profile.jobs.length === 0 ? (
              <EmptyState
                className="rounded-20 border border-neutral-100 bg-white py-14"
                description="Check back later for new openings."
                title="No open roles right now"
              />
            ) : (
              <div className="space-y-3">
                {profile.jobs.map((job) => (
                  <JobCard job={job} key={job.id} />
                ))}
              </div>
            )}

            <ReviewsSection
              categories={EMPLOYER_REVIEW_CATEGORIES}
              userId={profile.userId}
            />
          </div>

          <aside className="space-y-4">
            <div className="space-y-4 lg:sticky lg:top-6">
              <div className="rounded-20 border border-neutral-100 bg-white p-5">
                <h4 className="mb-3 text-[13px] font-semibold text-neutral-800">
                  Quick facts
                </h4>
                <dl className="space-y-2.5 text-[12.5px]">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-neutral-500">Open roles</dt>
                    <dd className="font-medium text-neutral-800">
                      {profile.activeJobCount}
                    </dd>
                  </div>
                  {profile.vnHireTotal > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-neutral-500">🇻🇳 VN hires</dt>
                      <dd className="font-medium text-neutral-800">
                        {profile.vnHireTotal}
                      </dd>
                    </div>
                  )}
                  {profile.avgFirstResponseHours != null && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-1.5 text-neutral-500">
                        <Timer size={11} /> Typical response
                      </dt>
                      <dd className="font-medium text-neutral-800">
                        {formatResponseTime(profile.avgFirstResponseHours)}
                      </dd>
                    </div>
                  )}
                  {profile.isVerified && profile.verifiedAt && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-neutral-500">Verified since</dt>
                      <dd className="font-medium text-neutral-800">
                        {new Date(profile.verifiedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {isOwnProfile && (
                <Link
                  className="flex items-center justify-center gap-1.5 rounded-12 border border-neutral-200 bg-white py-2.5 text-[12.5px] font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
                  to={ROUTES.employerDashboard}
                >
                  <Settings size={12} /> This is your company · Edit
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
