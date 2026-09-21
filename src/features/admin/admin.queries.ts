import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminJobModerationFlag,
  getAdminRevenue,
  listAdminAuditLog,
  listAdminEmployers,
  listAdminJobs,
  listAdminReports,
  listAdminUsers,
  regenerateAdminJobModerationFlag,
  resolveAdminReport,
  reviewAdminJob,
  updateAdminEmployer,
  updateAdminUser,
} from "@/features/admin/admin.service";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminKeys,
  jobKeys,
  jobModerationFlagKeys,
} from "@/core/query/query-keys";
import type { JobStatus } from "@/types/job";
import type { JobReportStatus } from "@/types/job-report";
import type { AdminAuditTargetType } from "@/types/admin";
import type { UserRole } from "@/types/user";

export const ADMIN_JOBS_KEY = adminKeys.jobs();
export const ADMIN_EMPLOYERS_KEY = adminKeys.employers();
export const ADMIN_REVENUE_KEY = adminKeys.revenue();

const ADMIN_LIST_LIMIT = 50;

// A review queue needs to reflect other admins'/employers' activity promptly —
// the global 60s staleTime with refetchOnWindowFocus disabled otherwise means a
// new submission won't show up until some unrelated action happens to
// invalidate this key.
const ADMIN_QUEUE_STALE_TIME_MS = 15_000;

export const useAdminJobs = (status: JobStatus = "PENDING_REVIEW") => {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.jobs(status),
    queryFn: ({ signal }) =>
      listAdminJobs({ status, limit: ADMIN_LIST_LIMIT }, { signal }),
    enabled: !!user && user.role === "ADMIN",
    staleTime: ADMIN_QUEUE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
};

export const useAdminEmployers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.employers(),
    queryFn: ({ signal }) =>
      listAdminEmployers({ limit: ADMIN_LIST_LIMIT }, { signal }),
    enabled: !!user && user.role === "ADMIN",
  });
};

export const useReviewAdminJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: "approve" | "reject";
      note?: string;
    }) => reviewAdminJob(id, action, note),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jobs() });
      // A review changes the job's public status (e.g. approved -> live) — without
      // this, the public jobs list/detail can keep showing stale data for up to a
      // minute (default staleTime) after an approval.
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
};

// enabled: false — this GET is not a cheap read, it's a real (billed) LLM
// call the first time it runs for a given job (a few seconds; the backend
// caches after that). Firing it implicitly for every row in the queue would
// silently rack up LLM cost/latency just from an admin scrolling past
// listings — it only ever runs when the admin explicitly clicks "Run AI
// risk check" (see AiRiskFlag) via refetch(). staleTime: Infinity because
// the result never changes once generated (no invalidation path — a job's
// description doesn't change once submitted for review), so there's
// nothing to silently go stale. Same pattern as useCvAnalysis.
export const useJobModerationFlag = (jobId: string) =>
  useQuery({
    queryKey: jobModerationFlagKeys.detail(jobId),
    queryFn: ({ signal }) => getAdminJobModerationFlag(jobId, { signal }),
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

// Explicit "run this again" action (AiRiskFlag's Re-check button) — always
// calls the LLM, even if useJobModerationFlag already has a cached result.
export const useRegenerateJobModerationFlag = (jobId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateAdminJobModerationFlag(jobId),
    onSuccess: (data) => {
      // Same reasoning as useRegenerateCvAnalysis: write straight into the
      // cache entry rather than invalidating a staleTime: Infinity,
      // enabled: false query, which wouldn't refetch on its own.
      queryClient.setQueryData(jobModerationFlagKeys.detail(jobId), data);
    },
  });
};

export const useUpdateAdminEmployer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "verify" | "suspend";
    }) => updateAdminEmployer(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.employers(),
      });
      // employer.isVerified is denormalized into every job list/detail response
      // (drives the "Verified" badge) — same class of gap already fixed for job
      // approval above, just missed here.
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      // NOT invalidating EMPLOYER_PROFILE_KEY here: that query is only enabled
      // for role:EMPLOYER sessions, and this mutation only ever runs in a
      // role:ADMIN session — invalidating it here can never reach the affected
      // employer's own (separate) browser session/QueryClient. Cross-session
      // cache staleness like this isn't fixable via client-side invalidation;
      // it needs server push (WebSocket/SSE) or a refetch interval, neither of
      // which exists here — the employer dashboard just self-corrects on its
      // next natural refetch (staleTime expiry, refocus, or remount).
    },
  });
};

export const useAdminRevenue = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.revenue(),
    queryFn: ({ signal }) => getAdminRevenue({ signal }),
    enabled: !!user && user.role === "ADMIN",
  });
};

export const useAdminReports = (status: JobReportStatus = "OPEN") => {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.reports(status),
    queryFn: ({ signal }) =>
      listAdminReports({ status, limit: ADMIN_LIST_LIMIT }, { signal }),
    enabled: !!user && user.role === "ADMIN",
    staleTime: ADMIN_QUEUE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
};

export const useResolveAdminReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "resolve" | "dismiss";
    }) => resolveAdminReport(id, action),
    // Never touches Job.status, so unlike useReviewAdminJob this doesn't
    // need to invalidate jobKeys — a resolved/dismissed report is purely an
    // admin-side signal.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
    },
  });
};

export const useAdminAuditLog = (
  page = 1,
  filter: { targetType?: AdminAuditTargetType; targetId?: string } = {}
) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.auditLog(page, filter.targetType, filter.targetId),
    queryFn: ({ signal }) =>
      listAdminAuditLog(
        { ...filter, page, limit: ADMIN_LIST_LIMIT },
        { signal }
      ),
    enabled: !!user && user.role === "ADMIN",
  });
};

// Fetches one large page, same as useAdminEmployers — AdminUsers filters
// role/banned/search client-side over that page rather than round-tripping
// on every keystroke or toggle.
export const useAdminUsers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: ({ signal }) =>
      listAdminUsers({ limit: ADMIN_LIST_LIMIT }, { signal }),
    enabled: !!user && user.role === "ADMIN",
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      role,
    }: {
      id: string;
      action: "ban" | "unban" | "change-role";
      role?: UserRole;
    }) => updateAdminUser(id, { action, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
};
