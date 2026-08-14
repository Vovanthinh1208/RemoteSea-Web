import type { ApplicationStatus } from "@/types/application";
import type {
  ExperienceLevel,
  JobStatus,
  JobType,
  PlanType,
} from "@/types/job";
import type {
  EmploymentType,
  NoticePeriod,
  RightToWork,
  TimezoneOverlap,
} from "@/types/talent";

export type EmployerVerificationStatus =
  "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "FAILED";

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
  // Self-service domain/email verification — a second, independent path to
  // isVerified alongside the admin verify/suspend toggle. isVerified stays
  // the one flag every badge reads; these two only drive the dashboard's
  // "Verify your company" prompt.
  verificationEmail: string | null;
  verificationStatus: EmployerVerificationStatus;
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
    // Employer Response SLA — avg hours from appliedAt to the first real
    // status change (any direction), over applications that have one.
    avgFirstResponseHours: number;
  };
};

export type EmployerApplicant = {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  // Application Transparency — set once the first time this applicant
  // appeared in a GET /employer/jobs/:id/applications response.
  viewedAt: string | null;
  // Only real transitions bump this (see the API's updateApplication) — used
  // to compute the same "stuck in REVIEWING" backlog signal the reminder
  // cron uses (see employer-dashboard.utils.ts's isBacklogged).
  updatedAt: string;
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
    // noticePeriod feeds the same match-score calculation as the fields
    // above (see match.util.ts's scoreAvailability). isOpenToWork doesn't —
    // it only decides whether ApplicantsPanel's AvailabilityBadge renders
    // (an applicant can have turned it off after applying).
    noticePeriod: NoticePeriod | null;
    isOpenToWork: boolean;
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
