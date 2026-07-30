import { useMemo } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createEmployerProfile,
  getEmployerProfile,
  listEmployerJobs,
  listJobApplications,
  updateApplicationStatus,
} from "@/features/employer/employer.service";
import { ApiError } from "@/core/errors/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { MY_APPLICATIONS_KEY } from "@/features/applications/applications.queries";
import { employerKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type { ApplicationStatus } from "@/types/application";
import type { EmployerApplicant } from "@/types/employer";

export const EMPLOYER_PROFILE_KEY = employerKeys.profile();
export const EMPLOYER_JOBS_KEY = employerKeys.jobs();

const NOT_FOUND_STATUS = 404;
const FORBIDDEN_STATUS = 403;
const APPLICATIONS_PER_JOB_LIMIT = 50;

export const useEmployerProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: employerKeys.profile(),
    queryFn: async ({ signal }) => {
      try {
        return await getEmployerProfile({ signal });
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.status === NOT_FOUND_STATUS ||
            err.status === FORBIDDEN_STATUS)
        ) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!user && user.role === "EMPLOYER",
  });
};

export const useCreateEmployerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employerKeys.profile(),
      });
    },
  });
};

export const useEmployerJobs = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: employerKeys.jobs(),
    queryFn: ({ signal }) => listEmployerJobs(undefined, { signal }),
    enabled: !!user && user.role === "EMPLOYER",
  });
};

export type ApplicantWithJob = EmployerApplicant & {
  jobId: string;
  jobTitle: string;
};

/**
 * GET /employer/jobs only returns a total application count per job, not a status
 * breakdown, and there's no "all applicants across every listing" endpoint. This
 * composes the real per-job endpoint (GET /employer/jobs/:id/applications) across
 * every listing that has at least one application so the dashboard's funnel and
 * recent-applicants panels can be built from real data instead of dropped.
 */
export const useEmployerApplicationsAggregate = () => {
  const { data: jobsData } = useEmployerJobs();
  const jobs = jobsData?.jobs ?? [];
  const jobIds = jobs
    .filter((j) => j._count.applications > 0)
    .map((j) => j.id);

  const results = useQueries({
    queries: jobIds.map((jobId) => ({
      queryKey: employerKeys.jobApplications(jobId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        listJobApplications(
          jobId,
          { limit: APPLICATIONS_PER_JOB_LIMIT },
          { signal }
        ),
      ...TIER.live,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  // A per-job fetch failing shouldn't be indistinguishable from "no applicants" —
  // surface it so the dashboard can show a retry instead of silently under-reporting.
  const isError = results.some((r) => r.isError);

  // Recompute only when the underlying query data actually changes, not on every
  // render of the consuming dashboard — each applicant object below is spread
  // fresh, so without this every downstream memo()'d ApplicantRow would re-render
  // on any unrelated parent re-render. `dataUpdatedAt` gives a fixed-length,
  // per-query change signal without depending on the (variable-length) data itself.
  const jobIdsKey = jobIds.join(",");
  const dataVersion = results.map((r) => r.dataUpdatedAt).join(",");
  const { byJobId, all } = useMemo(() => {
    const byJobId = new Map<string, EmployerApplicant[]>();
    jobIds.forEach((jobId, i) => {
      byJobId.set(jobId, results[i]?.data?.applications ?? []);
    });

    // Index jobs by id once (O(jobs)) instead of jobs.find per jobId inside the
    // flatMap, which was O(jobs × jobIds) — quadratic for an employer with many
    // listings that all have applicants.
    const titleById = new Map(jobs.map((j) => [j.id, j.title]));
    const all: ApplicantWithJob[] = jobIds.flatMap((jobId) =>
      (byJobId.get(jobId) ?? []).map((a) => ({
        ...a,
        jobId,
        jobTitle: titleById.get(jobId) ?? "",
      }))
    );

    return { byJobId, all };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIdsKey, dataVersion, jobs]);

  const refetchAll = () => results.forEach((r) => r.refetch());

  return {
    isLoading,
    isError,
    applications: all,
    byJobId,
    refetchAll,
  };
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      // Not sent to the API (the endpoint identifies the application by `id`
      // alone) — carried through purely so onSuccess can invalidate just this
      // job's applicants instead of every job's, which previously refetched
      // every listing's applicant list on every single status change.
      jobId: string;
      status: ApplicationStatus;
      notes?: string;
    }) => updateApplicationStatus(id, status, notes),
    onSuccess: (_data, { jobId }) => {
      queryClient.invalidateQueries({
        queryKey: employerKeys.jobApplications(jobId),
      });
      queryClient.invalidateQueries({
        queryKey: employerKeys.jobs(),
      });
      // The talent side's own applications list reads the same status this
      // mutation changes — low-impact today since employer/talent are separate
      // sessions, but matches the cross-feature invalidation pattern used
      // elsewhere and matters the moment any shared-session view exists.
      queryClient.invalidateQueries({
        queryKey: MY_APPLICATIONS_KEY,
      });
    },
  });
};
