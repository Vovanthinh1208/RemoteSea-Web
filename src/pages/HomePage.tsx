import { HeroSection } from "@/components/home/HeroSection";
import { StatsBand } from "@/components/home/StatsBand";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { SalaryBenchmark } from "@/components/home/SalaryBenchmark";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { FounderStorySection } from "@/components/home/FounderStorySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { EmployerCtaSection } from "@/components/home/EmployerCtaSection";
import { NewsletterCtaSection } from "@/components/home/NewsletterCtaSection";
import { useJobsQuery } from "@/features/jobs/jobs.queries";
import { useSalaryBenchmarks } from "@/features/salary/salary.queries";
import {
  DEFAULT_FILTERS_FETCH_LIMIT,
  DEFAULT_JOB_FILTERS,
} from "@/features/jobs/job-filters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// Sections live in components/home/* (one file per section with its own data,
// same convention as components/salary/* and employer-marketing/*). Queries
// stay here: hero and featured-jobs share one jobs fetch.

const FEATURED_JOBS_DISPLAY_COUNT = 4;

export const HomePage = () => {
  useDocumentTitle(
    "Remote Jobs from SG, AU & beyond",
    "Curated remote jobs from Singapore, Australia and beyond for Vietnamese talent — clear salary ranges, verified employers, and sensible timezones."
  );
  const { data } = useJobsQuery(
    DEFAULT_JOB_FILTERS,
    DEFAULT_FILTERS_FETCH_LIMIT
  );
  const featuredJobs = (data?.jobs ?? []).slice(0, FEATURED_JOBS_DISPLAY_COUNT);
  const { data: salaryBenches } = useSalaryBenchmarks();

  return (
    <>
      <HeroSection featuredJobs={featuredJobs} />
      <StatsBand />
      <HowItWorksSection />
      <CategoriesSection />
      <SalaryBenchmark benches={salaryBenches} />
      <FeaturedJobsSection featuredJobs={featuredJobs} />
      <FounderStorySection />
      <TestimonialsSection />
      <EmployerCtaSection />
      <NewsletterCtaSection />
    </>
  );
};
