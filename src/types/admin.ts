import type {
  Category,
  ExperienceLevel,
  JobStatus,
  JobType,
  PlanType,
} from "@/types/job";
import type { JobReportReason, JobReportStatus } from "@/types/job-report";

export type AdminJob = {
  id: string;
  employerId: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  jobType: JobType;
  level: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  isRemote: boolean;
  timezone: string | null;
  country: string | null;
  status: JobStatus;
  planType: PlanType;
  planPaid: boolean;
  benefits: string[];
  vnHireCount: number;
  reviewNote: string | null;
  isFeatured: boolean;
  viewCount: number;
  applyCount: number;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  employer: {
    companyName: string;
    isVerified: boolean;
    slug: string;
  };
  categories: { category: Category }[];
};

export type AdminJobsResponse = {
  jobs: AdminJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AdminEmployer = {
  id: string;
  userId: string;
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
  user: { email: string };
  _count: { jobs: number };
  jobCount: number;
  totalSpend: number;
};

export type AdminEmployersResponse = {
  employers: AdminEmployer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type RevenueMonthBucket = {
  key: string;
  label: string;
  standard: number;
  featured: number;
  handsOn: number;
};

export type RevenuePlanMix = {
  planType: PlanType;
  label: string;
  price: number;
  count: number;
  amount: number;
};

export type RevenueTransaction = {
  jobId: string;
  jobTitle: string;
  companyName: string;
  planType: PlanType;
  amount: number;
  paidAt: string;
};

export type RevenueResponse = {
  months: RevenueMonthBucket[];
  mix: RevenuePlanMix[];
  transactions: RevenueTransaction[];
  totals: { allTime: number; thisMonth: number };
};

export type AdminJobReport = {
  id: string;
  reason: JobReportReason;
  details: string | null;
  status: JobReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  job: {
    id: string;
    title: string;
    slug: string;
    status: JobStatus;
    employer: { companyName: string };
  };
  reporter: { id: string; email: string; name: string | null };
};

export type AdminJobReportsResponse = {
  reports: AdminJobReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AdminAuditAction =
  | "EMPLOYER_VERIFIED"
  | "EMPLOYER_SUSPENDED"
  | "JOB_APPROVED"
  | "JOB_REJECTED"
  | "JOB_REPORT_RESOLVED"
  | "JOB_REPORT_DISMISSED";

export type AdminAuditTargetType = "EMPLOYER" | "JOB" | "JOB_REPORT";

export type AdminAuditLogEntry = {
  id: string;
  adminId: string;
  // Snapshotted at write time (see the API's AdminAuditLog model) — stays
  // readable even if the admin's account is later renamed or removed.
  adminEmail: string;
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string;
  targetLabel: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
};

export type AdminAuditLogResponse = {
  entries: AdminAuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
