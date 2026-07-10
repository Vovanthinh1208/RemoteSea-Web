import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRevenue,
  listAdminEmployers,
  listAdminJobs,
  reviewAdminJob,
  updateAdminEmployer,
} from "@/features/admin/admin.service";
import { useAuth } from "@/contexts/AuthContext";
import { adminKeys, jobKeys } from "@/core/query/query-keys";
import type { JobStatus } from "@/types/job";

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
    queryFn: ({ signal }) => listAdminJobs({ status, limit: ADMIN_LIST_LIMIT }, { signal }),
    enabled: !!user && user.role === "ADMIN",
    staleTime: ADMIN_QUEUE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
};

export const useAdminEmployers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.employers(),
    queryFn: ({ signal }) => listAdminEmployers({ limit: ADMIN_LIST_LIMIT }, { signal }),
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

export const useUpdateAdminEmployer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "verify" | "suspend" }) =>
      updateAdminEmployer(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.employers() });
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
