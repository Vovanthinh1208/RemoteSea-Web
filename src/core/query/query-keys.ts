import type { JobFilters } from "@/features/jobs/job-filters";
import type { TalentSearchFilters } from "@/features/employer/talent-search/talent-search.filters";

// One factory per feature, all defined here up front so cross-feature invalidation
// (e.g. jobs invalidating employer's job list) never has to import another feature's
// .queries.ts file. Key arrays match today's hand-written keys exactly — this file
// centralizes them, it does not change what's cached under what key.

export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters: JobFilters, limit: number) =>
    ["jobs", filters, limit] as const,
  details: () => ["job"] as const,
  detail: (id: string | undefined) => ["job", id] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  jobs: (status?: string) =>
    status
      ? (["admin", "jobs", status] as const)
      : (["admin", "jobs"] as const),
  employers: () => ["admin", "employers"] as const,
  revenue: () => ["admin", "revenue"] as const,
  reports: (status?: string) =>
    status
      ? (["admin", "reports", status] as const)
      : (["admin", "reports"] as const),
  auditLog: (page: number, targetType?: string, targetId?: string) =>
    ["admin", "audit-log", page, targetType, targetId] as const,
};

export const alertKeys = {
  all: ["alerts"] as const,
};

export const applicationKeys = {
  all: ["applications"] as const,
  mine: (page: number, limit: number) =>
    ["applications", "me", page, limit] as const,
  // DB-computed status breakdown (total + per-status counts) — see TalentDashboard's
  // KPI tiles, which need an accurate total/interviewing/offers count even beyond
  // whatever page size `mine()` is fetched at.
  stats: () => ["applications", "stats"] as const,
  // Membership set (applied job ids) for "already applied?" checks — the
  // ApplyButton twin of savedKeys.ids().
  ids: () => ["applications", "ids"] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
};

export const employerKeys = {
  all: ["employer"] as const,
  profile: () => ["employer", "profile"] as const,
  jobs: () => ["employer", "jobs"] as const,
  jobApplications: (jobId: string) =>
    ["employer", "job-applications", jobId] as const,
  public: (slug: string | undefined) => ["employer", "public", slug] as const,
};

export const invitationKeys = {
  all: ["invitations"] as const,
  mine: () => ["invitations", "me"] as const,
};

export const teamKeys = {
  members: () => ["team", "members"] as const,
  invitations: () => ["team", "invitations"] as const,
  preview: (token: string) => ["team", "invitation-preview", token] as const,
};

export const talentSearchKeys = {
  all: ["talent-search"] as const,
  // `forJob` is excluded on purpose — it drives client-side match sorting only
  // (see match.util.ts) and is never sent to GET /talent, so keying the cache
  // on it would mint a fresh cache entry / refetch for every job the employer
  // picks to rank against, even though the server response is identical.
  list: (filters: TalentSearchFilters, limit: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { forJob, ...serverFilters } = filters;
    return ["talent-search", serverFilters, limit] as const;
  },
};

export const salaryKeys = {
  benchmarks: () => ["salary", "benchmarks"] as const,
  benchmarksBySeniority: () =>
    ["salary", "benchmarks", "by-seniority"] as const,
  benchmarksByCountry: () => ["salary", "benchmarks", "by-country"] as const,
};

export const savedKeys = {
  all: ["saved"] as const,
  // Prefix for every paginated saved-jobs list page — lets mutations invalidate
  // the display lists without also refetching the ids set (which optimistic
  // updates keep exact on their own).
  jobsPrefix: ["saved", "jobs"] as const,
  jobs: (page: number, limit: number) =>
    ["saved", "jobs", page, limit] as const,
  // Full membership set (job ids only) for client-side "is this job saved?" checks
  // (e.g. the JobCard heart icon) — deliberately separate from the paginated
  // display list above, which can't answer that question once paginated.
  ids: () => ["saved", "ids"] as const,
};

export const talentKeys = {
  mine: () => ["talent", "me"] as const,
  publicAll: () => ["talent", "public"] as const,
  public: (slug: string | undefined) => ["talent", "public", slug] as const,
  profileViews: () => ["talent", "me", "profile-views"] as const,
};

export const workExperienceKeys = {
  mine: () => ["talent", "me", "experience"] as const,
};

export const profileHighlightKeys = {
  mine: () => ["talent", "me", "highlights"] as const,
};

export const activityKeys = {
  mine: () => ["talent", "me", "activity"] as const,
};

export const taxonomyKeys = {
  categories: () => ["categories"] as const,
  skills: (q?: string) => ["skills", q ?? ""] as const,
};

export const sessionKeys = {
  all: ["session"] as const,
};

export const authKeys = {
  twoFactorStatus: () => ["auth", "2fa", "status"] as const,
};

export const usersKeys = {
  account: () => ["users", "me", "account"] as const,
  notificationPreferences: () =>
    ["users", "me", "notification-preferences"] as const,
  pauseState: () => ["users", "me", "pause"] as const,
  connections: () => ["users", "me", "connections"] as const,
  sessions: () => ["users", "me", "sessions"] as const,
};

export const notificationKeys = {
  // Prefix for every paginated notifications list page — lets mark-read
  // mutations invalidate the display lists without also refetching
  // unreadCount (which optimistic updates keep exact on their own), same
  // split as savedKeys.jobsPrefix/ids.
  listsPrefix: ["notifications", "list"] as const,
  list: (page: number, limit: number) =>
    ["notifications", "list", page, limit] as const,
  unreadCount: () => ["notifications", "unread-count"] as const,
};

export const messageKeys = {
  thread: (applicationId: string) =>
    ["messages", "thread", applicationId] as const,
};

export const interviewKeys = {
  detail: (applicationId: string) =>
    ["interviews", "detail", applicationId] as const,
  upcoming: () => ["interviews", "upcoming"] as const,
};

export const reviewKeys = {
  eligibility: (applicationId: string) =>
    ["reviews", "eligibility", applicationId] as const,
  forUserPrefix: (userId: string) => ["reviews", "user", userId] as const,
  forUser: (userId: string, page: number) =>
    ["reviews", "user", userId, page] as const,
};

export const scorecardKeys = {
  list: (applicationId: string) =>
    ["scorecards", "list", applicationId] as const,
};

export const cvAnalysisKeys = {
  detail: (applicationId: string) =>
    ["cv-analysis", "detail", applicationId] as const,
};
