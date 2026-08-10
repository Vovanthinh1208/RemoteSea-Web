export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE";
export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
export type JobStatus =
  "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "CLOSED" | "REJECTED";
export type PlanType = "STANDARD" | "FEATURED" | "HANDS_ON";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};
export type Skill = { id: string; name: string; slug: string };

export type JobFacets = {
  jobType: Record<string, number>;
  timezone: Record<string, number>;
  seniority: Record<string, number>;
  category: Record<string, number>;
};

export type JobEmployerSummary = {
  companyName: string;
  logoUrl: string | null;
  slug: string;
  isVerified: boolean;
  size?: string | null;
  description?: string | null;
  hqCountry?: string | null;
};

export type Job = {
  id: string;
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
  benefits: string[];
  vnHireCount: number;
  isFeatured: boolean;
  viewCount: number;
  applyCount: number;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  employer: JobEmployerSummary;
  categories: { category: Category }[];
  skills: { skill: Skill }[];
};

// GET /jobs (the paginated board) sends a deliberately narrower shape than the
// single-job detail response — only what JobCard and RecommendedJobs actually
// render. No description/requirements/benefits/currency/status/planType/counts,
// which used to be sent (unused) for every card on every page of results.
export type JobListItemEmployer = {
  companyName: string;
  isVerified: boolean;
};

export type JobListItem = {
  id: string;
  title: string;
  jobType: JobType;
  level: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  isRemote: boolean;
  timezone: string | null;
  country: string | null;
  isFeatured: boolean;
  vnHireCount: number;
  publishedAt: string | null;
  createdAt: string;
  employer: JobListItemEmployer;
  categories: { category: Category }[];
  skills: { skill: Skill }[];
};
