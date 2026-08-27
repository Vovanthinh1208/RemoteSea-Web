import { Link } from "react-router-dom";
import { Timer } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { countryFlag } from "@/features/jobs/jobs.utils";
import { ReportJobForm } from "@/features/jobs/pages/job-detail/ReportJobForm";
import { formatResponseTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import type { Job } from "@/types/job";

interface JobCompanyCardProps {
  job: Job;
}

export const JobCompanyCard = ({ job }: JobCompanyCardProps) => {
  const country = job.country ?? job.employer.hqCountry ?? "Remote";

  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-5">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-neutral-400">
        Company
      </h3>
      <Link
        className="mb-3 flex items-center gap-3 rounded-8 focus-visible:shadow-focus focus-visible:outline-none"
        to={ROUTES.companyProfile(job.employer.slug)}
      >
        <CompanyLogo name={job.employer.companyName} size={40} />
        <div>
          <p className="text-[14px] font-semibold text-neutral-900 transition-colors hover:text-brand-700 hover:underline">
            {job.employer.companyName}
          </p>
          <p className="text-[12px] text-neutral-400">
            {countryFlag(job.country)} {country}
            {job.employer.size ? ` · ${job.employer.size} employees` : ""}
          </p>
        </div>
      </Link>
      {job.employer.description && (
        <p className="mb-3 text-[13px] leading-relaxed text-neutral-500">
          {job.employer.description}
        </p>
      )}
      {job.employer.avgFirstResponseHours != null && (
        <p className="flex items-center gap-1.5 text-[12px] text-neutral-400">
          <Timer size={12} />
          Typically responds within{" "}
          <span className="font-medium text-neutral-600">
            {formatResponseTime(job.employer.avgFirstResponseHours)}
          </span>
        </p>
      )}
      <ReportJobForm jobId={job.id} />
    </div>
  );
};
