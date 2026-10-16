import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { JobCard } from "@/features/jobs/components/JobCard";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES } from "@/constants/routes";
import type { JobListItem } from "@/types/job";
import { useTranslation } from "@/i18n/useTranslation";

interface FeaturedJobsSectionProps {
  featuredJobs: JobListItem[];
}

export const FeaturedJobsSection = ({
  featuredJobs,
}: FeaturedJobsSectionProps) => {
  const { t } = useTranslation("home");
  return (
    <section className="pb-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Eyebrow className="mb-2">{t("featured.eyebrow")}</Eyebrow>
            <h2 className="text-[28px] font-semibold text-neutral-900">
              {t("featured.title")}
              <em className="font-serif-italic">{t("featured.titleEm")}</em>
            </h2>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 rounded-8 text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
            to={ROUTES.jobs}
          >
            {t("featured.browseAll")} <ArrowRight size={14} />
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
};
