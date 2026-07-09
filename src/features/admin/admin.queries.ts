import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRevenue,
  listAdminEmployers,
  listAdminJobs,
  reviewAdminJob,
  updateAdminEmployer,
} from "@/features/admin/admin.api";
import { useAuth } from "@/contexts/AuthContext";
import type { JobStatus } from "@/types/job";

export const ADMIN_JOBS_KEY = ["admin", "jobs"];
export const ADMIN_EMPLOYERS_KEY = ["admin", "employers"];
export const ADMIN_REVENUE_KEY = ["admin", "revenue"];

const ADMIN_LIST_LIMIT = 50;

// A review queue needs to reflect other admins'/employers' activity promptly —
// the global 60s staleTime with refetchOnWindowFocus disabled otherwise means a
// new submission won't show up until some unrelated action happens to
// invalidate this key.
const ADMIN_QUEUE_STALE_TIME_MS = 15_000;

export const useAdminJobs = (status: JobStatus = "PENDING_REVIEW") => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...ADMIN_JOBS_KEY, status],
    queryFn: () => listAdminJobs({ status, limit: ADMIN_LIST_LIMIT }),
    enabled: !!user && user.role === "ADMIN",
    staleTime: ADMIN_QUEUE_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
};

export const useAdminEmployers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ADMIN_EMPLOYERS_KEY,
    queryFn: () => listAdminEmployers({ limit: ADMIN_LIST_LIMIT }),
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
      queryClient.invalidateQueries({ queryKey: ADMIN_JOBS_KEY });
      // A review changes the job's public status (e.g. approved -> live) — without
      // this, the public jobs list/detail can keep showing stale data for up to a
      // minute (default staleTime) after an approval.
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
  });
};

export const useUpdateAdminEmployer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "verify" | "suspend" }) =>
      updateAdminEmployer(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EMPLOYERS_KEY });
      // employer.isVerified is denormalized into every job list/detail response
      // (drives the "Verified" badge) — same class of gap already fixed for job
      // approval above, just missed here.
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useAdminRevenue = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ADMIN_REVENUE_KEY,
    queryFn: getAdminRevenue,
    enabled: !!user && user.role === "ADMIN",
  });
};
