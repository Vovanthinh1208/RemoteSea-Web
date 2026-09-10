import { Link } from "react-router-dom";
import { ArrowRight, Bell, ShieldCheck } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { SalaryBadge } from "@/components/ui/salary-badge";
import { Tag } from "@/components/ui/tag";
import { LEVEL_LABELS } from "@/features/jobs/jobs.utils";
import { countryFlag } from "@/utils/color";
import { ROUTES } from "@/constants/routes";
import type { JobListItem } from "@/types/job";

interface HeroSectionProps {
  featuredJobs: JobListItem[];
}

export const HeroSection = ({ featuredJobs }: HeroSectionProps) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-50 to-white" />
    <div className="mx-auto grid max-w-[1240px] items-center gap-16 px-6 py-20 lg:grid-cols-2">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-100 bg-white px-3 py-1.5 text-[13px] text-neutral-500 shadow-[0_1px_2px_rgba(26,25,23,0.06)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-600" />
          47 jobs live · updated today
        </div>

        <h1 className="mb-5 text-[44px] font-semibold leading-[1.1] tracking-tight text-neutral-900 lg:text-[52px]">
          Remote jobs from Singapore, Australia &amp; beyond —{" "}
          <em className="font-serif-italic text-brand-700">curated</em> for
          Vietnam talent.
        </h1>

        <p className="mb-8 max-w-xl text-[17px] leading-relaxed text-neutral-500">
          Việt Nam has talent. The world has jobs. We connect both — with clear
          salary ranges, sensible timezones, and employers we&apos;ve actually
          vetted.
        </p>

        <div className="mb-8 flex items-center gap-3">
          <Link
            className="inline-flex h-[52px] items-center gap-2 rounded-12 bg-brand-600 px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            to={ROUTES.jobs}
          >
            Browse 47 open jobs
            <ArrowRight size={16} />
          </Link>
          <Link
            className="inline-flex h-[52px] items-center gap-2 rounded-12 px-6 text-[15px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:shadow-focus focus-visible:outline-none"
            to={ROUTES.register}
          >
            <Bell size={16} />
            Get weekly alerts
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-400">
          {/* Two brand tones, not four unrelated hues (amber, brand-green,
              a stock blue outside this project's palette, and neutral) —
              purely decorative "diverse people" avatars, so the color
              itself carries no meaning worth spending 4 accents on. Still
              4 circles (the "and more" social-proof read stays intact),
              just alternating between 2 tones instead of 4.  */}
          <div className="flex -space-x-1.5">
            {["#2E9B52", "#6DBF82", "#2E9B52", "#6DBF82"].map((c, i) => (
              <span
                className="h-7 w-7 rounded-full border-2 border-neutral-50"
                key={i}
                style={{
                  background: `linear-gradient(135deg, ${c}, ${c}dd)`,
                }}
              />
            ))}
          </div>
          Free for talent · 500+ VN professionals already on board
        </div>
      </div>

      {/* Float cards */}
      <div className="hidden flex-col gap-3 lg:flex">
        {featuredJobs.map((job, i) => {
          const country = job.country ?? "Remote";
          const timezone = job.timezone ?? (job.isRemote ? "Remote" : country);
          return (
            <div
              className="flex animate-fade-up items-center gap-3 rounded-12 border border-neutral-100 bg-white p-4 shadow-card"
              key={job.id}
              style={{ animationDelay: `${100 + i * 120}ms` }}
            >
              <CompanyLogo name={job.employer.companyName} size={36} />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5 text-[12px] text-neutral-400">
                  {job.employer.isVerified && (
                    <ShieldCheck className="text-brand-600" size={11} />
                  )}
                  {job.employer.companyName} · {countryFlag(job.country)}{" "}
                  {country}
                </div>
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {job.title}
                </p>
                <div className="mt-1 flex gap-1.5">
                  <Tag>{timezone}</Tag>
                  <Tag>{LEVEL_LABELS[job.level]}</Tag>
                </div>
              </div>
              <SalaryBadge max={job.salaryMax} min={job.salaryMin} />
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
