import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { JobCard } from "@/features/jobs/components/JobCard";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES } from "@/constants/routes";
import type { JobListItem } from "@/types/job";

interface FeaturedJobsSectionProps {
  featuredJobs: JobListItem[];
}

export const FeaturedJobsSection = ({
  featuredJobs,
}: FeaturedJobsSectionProps) => (
  <section className="pb-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow className="mb-2">Live now</Eyebrow>
          <h2 className="text-[28px] font-semibold text-neutral-900">
            Jobs open{" "}
            <em
              className="font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              right now
            </em>
          </h2>
        </div>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          to={ROUTES.jobs}
        >
          Browse all 47 jobs <ArrowRight size={14} />
        </Link>
      </div>
      <div className="space-y-2">
        {featuredJobs.map((job) => (
          <JobCard job={job} key={job.id} />
        ))}
      </div>
    </div>
  </section>
);
