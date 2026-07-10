import type { JobFilters } from "@/features/jobs/job-filters";

// One factory per feature, all defined here up front so cross-feature invalidation
// (e.g. jobs invalidating employer's job list) never has to import another feature's
// .queries.ts file. Key arrays match today's hand-written keys exactly — this file
// centralizes them, it does not change what's cached under what key.

export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters: JobFilters, limit: number) => ["jobs", filters, limit] as const,
  details: () => ["job"] as const,
  detail: (id: string | undefined) => ["job", id] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  jobs: (status?: string) =>
    status ? (["admin", "jobs", status] as const) : (["admin", "jobs"] as const),
  employers: () => ["admin", "employers"] as const,
  revenue: () => ["admin", "revenue"] as const,
};

export const alertKeys = {
  all: ["alerts"] as const,
};

export const applicationKeys = {
  mine: () => ["applications", "me"] as const,
};

export const employerKeys = {
  all: ["employer"] as const,
  profile: () => ["employer", "profile"] as const,
  jobs: () => ["employer", "jobs"] as const,
  jobApplications: (jobId: string) => ["employer", "job-applications", jobId] as const,
};

export const salaryKeys = {
  benchmarks: () => ["salary", "benchmarks"] as const,
};

export const savedKeys = {
  all: ["saved"] as const,
  jobs: () => ["saved", "jobs"] as const,
};

export const talentKeys = {
  mine: () => ["talent", "me"] as const,
  public: (slug: string | undefined) => ["talent", "public", slug] as const,
};

export const taxonomyKeys = {
  categories: () => ["categories"] as const,
  skills: (q?: string) => ["skills", q ?? ""] as const,
};

export const sessionKeys = {
  all: ["session"] as const,
};
