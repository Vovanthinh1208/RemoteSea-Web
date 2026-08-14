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
import {
  computeMatchScore,
  type MatchResult,
} from "@/features/matching/match.util";

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
          (err.status === NOT_FOUND_STATUS || err.status === FORBIDDEN_STATUS)
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
  match: MatchResult | null;
};

export const useEmployerApplicationsAggregate = () => {
  const { data: jobsData } = useEmployerJobs();
  const jobs = jobsData?.jobs ?? [];
  const jobIds = jobs.filter((j) => j._count.applications > 0).map((j) => j.id);

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
  const isError = results.some((r) => r.isError);

  const jobIdsKey = jobIds.join(",");
  const dataVersion = results.map((r) => r.dataUpdatedAt).join(",");
  const { byJobId, all } = useMemo(() => {
    const byJobId = new Map<string, EmployerApplicant[]>();
    jobIds.forEach((jobId, i) => {
      byJobId.set(jobId, results[i]?.data?.applications ?? []);
    });

    const jobById = new Map(jobs.map((j) => [j.id, j]));
    const all: ApplicantWithJob[] = jobIds.flatMap((jobId) => {
      const job = jobById.get(jobId);
      return (byJobId.get(jobId) ?? []).map((a) => ({
        ...a,
        jobId,
        jobTitle: job?.title ?? "",
        match: job ? computeMatchScore(job, a.talent) : null,
      }));
    });

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
      queryClient.invalidateQueries({
        queryKey: MY_APPLICATIONS_KEY,
      });
    },
  });
};
