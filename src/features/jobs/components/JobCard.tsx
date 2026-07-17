import { memo } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Clock, RefreshCw, ShieldCheck, Star } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Badge } from "@/components/ui/badge";
import { SalaryBadge } from "@/components/ui/salary-badge";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/utils/cn";
import { useSavedJobToggle } from "@/features/jobs/useSavedJobToggle";
import { prefetchJob } from "@/features/jobs/jobs.queries";
import { prefetchJobDetailChunk } from "@/features/jobs/prefetch-detail-chunk";
import {
  JOB_TYPE_LABELS,
  LEVEL_LABELS,
  countryFlag,
  isAsyncTimezone,
  timeAgo,
} from "@/features/jobs/jobs.utils";
import { ROUTES } from "@/constants/routes";
import type { JobListItem } from "@/types/job";

interface JobCardProps {
  job: JobListItem;
}

export const JobCard = memo(function JobCard({ job }: JobCardProps) {
  const { saved, statusUnknown, toggle } = useSavedJobToggle(job.id, ROUTES.jobs);
  const queryClient = useQueryClient();

  // Job-board -> job-detail is the single most common navigation in the app;
  // prefetching on hover means the detail page's data is often already cached
  // by the time the click lands, instead of always showing a skeleton.
  const handlePrefetchJob = () => {
    void prefetchJob(queryClient, job.id);
    prefetchJobDetailChunk();
  };

  const country = job.country ?? "Remote";
  const timezone = job.timezone ?? (job.isRemote ? "Remote" : country);
  const isAsync = isAsyncTimezone(timezone);
  const category = job.categories[0]?.category.name ?? "Other";

  return (
    // A <button> nested inside this card's own <Link> is invalid HTML (interactive
    // content inside interactive content) and produces inconsistent screen-reader
    // behavior. Instead: the title is the real, keyboard-reachable link, extended
    // with a `after:absolute after:inset-0` overlay so the whole card is still
    // clickable — and the save button sits at `z-10` above that overlay as a
    // sibling, not a descendant, of the anchor.
    <article
      className={cn(
        "group relative flex items-start gap-4 rounded-12 border border-neutral-100 bg-white p-5 transition-all duration-150 hover:border-neutral-200 hover:shadow-card",
        job.isFeatured && "border-l-2 border-l-amber-400"
      )}
    >
      <CompanyLogo name={job.employer.companyName} size={44} />

      <div className="min-w-0 flex-1">
        {/* Row 1 — company + badges */}
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          {job.employer.isVerified && (
            <Badge variant="verified">
              <ShieldCheck size={10} />
              Verified
            </Badge>
          )}
          <span className="text-[13px] font-medium text-neutral-600">
            {job.employer.companyName}
          </span>
          <span className="text-[13px] text-neutral-400">
            {countryFlag(job.country)} {country}
          </span>
          {job.isFeatured && (
            <Badge variant="featured">
              <Star size={10} />
              Featured
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-[15px] font-semibold leading-snug text-neutral-900">
          <Link
            className="transition-colors after:absolute after:inset-0 group-hover:text-brand-700"
            to={ROUTES.jobDetail(job.id)}
            onMouseEnter={handlePrefetchJob}
          >
            {job.title}
          </Link>
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag>{category}</Tag>
          <Tag>{LEVEL_LABELS[job.level]}</Tag>
          <Tag>{JOB_TYPE_LABELS[job.jobType]}</Tag>
          <Tag>
            {isAsync ? <RefreshCw size={11} /> : <Clock size={11} />}
            {timezone}
          </Tag>
          {job.vnHireCount > 0 && <Badge variant="vn">🇻🇳 {job.vnHireCount} VN here</Badge>}
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <SalaryBadge max={job.salaryMax} min={job.salaryMin} />
        <span className="text-[12px] text-neutral-400">
          {timeAgo(job.publishedAt ?? job.createdAt)} ago
        </span>
        <button
          aria-label={saved ? "Unsave job" : "Save job"}
          className={cn(
            "relative z-10 grid h-8 w-8 place-items-center rounded-8 transition-colors focus-visible:shadow-focus focus-visible:outline-none",
            statusUnknown
              ? "text-transparent"
              : saved
                ? "text-brand-600"
                : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          )}
          disabled={statusUnknown}
          onClick={toggle}
        >
          <Bookmark fill={saved ? "currentColor" : "none"} size={15} />
        </button>
      </div>
    </article>
  );
});
