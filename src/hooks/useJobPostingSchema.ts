import { useEffect } from "react";
import type { Job } from "@/types/job";

const EMPLOYMENT_TYPE: Record<Job["jobType"], string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  FREELANCE: "CONTRACTOR",
};

// Injects a Google-for-Jobs-compatible JobPosting script tag while this page is
// mounted. Without this, a client-only SPA has nothing for a crawler to index
// per job — every listing is invisible to job search engines.
export const useJobPostingSchema = (job: Job | undefined): void => {
  useEffect(() => {
    if (!job) return;

    const schema = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.title,
      description: job.description,
      datePosted: job.publishedAt ?? job.createdAt,
      ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
      employmentType: EMPLOYMENT_TYPE[job.jobType],
      hiringOrganization: {
        "@type": "Organization",
        name: job.employer.companyName,
        ...(job.employer.logoUrl ? { logo: job.employer.logoUrl } : {}),
      },
      jobLocationType: job.isRemote ? "TELECOMMUTE" : undefined,
      ...(job.country
        ? {
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressCountry: job.country,
              },
            },
          }
        : {}),
      ...(job.salaryMin
        ? {
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: job.currency,
              value: {
                "@type": "QuantitativeValue",
                minValue: job.salaryMin,
                ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
                unitText: "MONTH",
              },
            },
          }
        : {}),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [job]);
};
