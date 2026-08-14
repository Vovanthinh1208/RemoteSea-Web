import type { ApplicationStatus } from "@/types/application";
import type {
  ExperienceLevel,
  JobStatus,
  JobType,
  PlanType,
} from "@/types/job";
import type {
  EmploymentType,
  RightToWork,
  TimezoneOverlap,
} from "@/types/talent";

export type EmployerProfile = {
  id: string;
  companyName: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  industry: string | null;
  size: string | null;
  founded: number | null;
  hqCountry: string | null;
  hqCity: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployerProfileSummary = EmployerProfile & {
  _count: { jobs: number };
  totalApplications: number;
};

export type CreateEmployerProfilePayload = {
  companyName: string;
  websiteUrl?: string;
  description?: string;
  industry?: string;
  size?: string;
  hqCountry?: string;
  hqCity?: string;
};

export type UpdateEmployerProfilePayload =
  Partial<CreateEmployerProfilePayload> & {
    founded?: number;
    logoUrl?: string;
  };

export type EmployerJobListItem = {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  planType: PlanType;
  planPaid: boolean;
  viewCount: number;
  applyCount: number;
  publishedAt: string | null;
  createdAt: string;
  _count: { applications: number };
  // Not rendered directly by the jobs list — carried so the dashboard can
  // score this job's applicants against it (see ApplicantsPanel's match
  // badge) without a second fetch.
  level: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  jobType: JobType;
  timezone: string | null;
  country: string | null;
  isRemote: boolean;
  skills: { isRequired: boolean; skill: { id: string } }[];
};

export type EmployerJobsResponse = {
  jobs: EmployerJobListItem[];
  stats: {
    totalApps: number;
    shortlisted: number;
    avgTimeToHireInDays: number;
  };
};

export type EmployerApplicant = {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  coverLetter: string | null;
  talent: {
    id: string;
    slug: string;
    headline: string | null;
    level: string;
    user: { name: string | null };
    skills: { skill: { id: string; name: string } }[];
    // Not rendered directly — feeds the same match-score calculation as
    // EmployerJobListItem's added fields above. Already shown to anyone
    // viewing this talent's public profile (see talent/interfaces.ts's
    // publicProfileArgs on the API side).
    yearsExperience: number | null;
    desiredSalaryMin: number | null;
    desiredSalaryMax: number | null;
    currency: string;
    timezone: string | null;
    country: string | null;
    employmentTypes: EmploymentType[];
    timezoneOverlap: TimezoneOverlap[];
    rightToWork: RightToWork | null;
  };
};

export type EmployerJobApplicationsResponse = {
  applications: EmployerApplicant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
