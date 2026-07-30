import { Clock, Users } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Badge } from "@/components/ui/badge";
import { SalaryBadge } from "@/components/ui/salary-badge";
import { Tag } from "@/components/ui/tag";
import {
  JOB_TYPE_LABELS,
  LEVEL_LABELS,
  countryFlag,
  timeAgo,
} from "@/features/jobs/jobs.utils";
import type { Job } from "@/types/job";
import { VerifiedInline } from "@/components/shared/VerifiedInline";

interface JobHeaderCardProps {
  job: Job;
}

export const JobHeaderCard = ({ job }: JobHeaderCardProps) => {
  const country = job.country ?? job.employer.hqCountry ?? "Remote";
  const timezone =
    job.timezone ?? (job.isRemote ? "Remote" : country);
  const category = job.categories[0]?.category.name ?? "Other";
  return (
    <div className="mb-6 flex items-start gap-4 rounded-16 border border-neutral-100 bg-white p-6 shadow-card">
      <CompanyLogo name={job.employer.companyName} size={56} />
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2 text-sm text-neutral-400">
          {job.employer.isVerified && (
            <VerifiedInline
              className="gap-1"
              iconSize={13}
              label="Verified employer"
            />
          )}
          {job.employer.isVerified && <span>·</span>}
          <span>
            {countryFlag(job.country)} {country}
          </span>
        </div>
        <h1 className="mb-1 text-[22px] font-semibold text-neutral-900">
          {job.title}
        </h1>
        <p className="text-[15px] text-neutral-500">
          {job.employer.companyName}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {job.isFeatured && (
            <Badge variant="featured">⭐ Featured</Badge>
          )}
          <Tag>{category}</Tag>
          <Tag>{LEVEL_LABELS[job.level]}</Tag>
          <Tag>{JOB_TYPE_LABELS[job.jobType]}</Tag>
          <Tag>{timezone}</Tag>
          {job.vnHireCount > 0 && (
            <Badge variant="vn">
              <Users size={10} /> {job.vnHireCount} VN on team
            </Badge>
          )}
        </div>
      </div>
      <div className="hidden flex-col items-end gap-2 sm:flex">
        <SalaryBadge max={job.salaryMax} min={job.salaryMin} />
        <span className="inline-flex items-center gap-1 text-[12px] text-neutral-400">
          <Clock size={11} /> Posted{" "}
          {timeAgo(job.publishedAt ?? job.createdAt)} ago
        </span>
      </div>
    </div>
  );
};
