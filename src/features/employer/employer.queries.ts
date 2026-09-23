import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkUpdateApplicationStatus,
  confirmEmployerVerification,
  createEmployerProfile,
  exportJobApplicantsCsv,
  getEmployerDashboard,
  getEmployerProfile,
  getHiringFunnel,
  getPublicCompanyProfile,
  listEmployerJobs,
  listRecentApplications,
  submitEmployerVerification,
  updateApplicationStatus,
} from "@/features/employer/employer.service";
import { downloadBlob } from "@/utils/download-blob";
import { ApiError } from "@/core/errors/api-error";
import { useAuth } from "@/contexts/AuthContext";
import { MY_APPLICATIONS_KEY } from "@/features/applications/applications.queries";
import { employerKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type { ApplicationStatus } from "@/types/application";
import type {
  EmployerApplicant,
  EmployerJobListItem,
  EmployerRecentApplicationsResponse,
} from "@/types/employer";
import {
  computeMatchScore,
  type MatchResult,
} from "@/features/matching/match.util";

export const EMPLOYER_PROFILE_KEY = employerKeys.profile();
export const EMPLOYER_JOBS_KEY = employerKeys.jobs();

const NOT_FOUND_STATUS = 404;
const FORBIDDEN_STATUS = 403;

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
    // Same catch as useEmployerProfile above, for the same reason: a
    // newly-registered EMPLOYER with no company yet gets a 403 here
    // (COMPANY_MEMBERSHIP_REQUIRED), not a real failure — before this,
    // EmployerDashboard's `profileErrored || jobsErrored` check treated
    // that as a generic "Couldn't load your dashboard" error with a "Try
    // again" that could never succeed. Returning null (not undefined —
    // React Query itself throws "Query data cannot be undefined" and
    // turns that into an error state, defeating this exact catch) lets
    // the dashboard's own existing `jobsData?.jobs ?? []` /
    // `jobsData?.stats ?? {...}` fallbacks render its normal empty state.
    queryFn: async ({ signal }) => {
      try {
        return await listEmployerJobs(undefined, { signal });
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

export type ApplicantWithJob = EmployerApplicant & {
  jobId: string;
  jobTitle: string;
  match: MatchResult | null;
};

// Shared by useEmployerApplicationsAggregate and useEmployerDashboard below —
// both end up with the same two raw pieces (a company's jobs, its recent
// applications) and need the same match-scored, per-job-grouped shape built
// from them; pulled out once so that computation can't drift between the
// two call sites.
const buildApplicantsAggregate = (
  jobs: EmployerJobListItem[],
  applications: EmployerRecentApplicationsResponse["applications"]
): { byJobId: Map<string, EmployerApplicant[]>; all: ApplicantWithJob[] } => {
  const jobById = new Map(jobs.map((j) => [j.id, j]));

  const byJobId = new Map<string, EmployerApplicant[]>();
  const all: ApplicantWithJob[] = applications.map((a) => {
    const { jobId, jobTitle, ...applicant } = a;
    const existing = byJobId.get(jobId);
    if (existing) existing.push(applicant);
    else byJobId.set(jobId, [applicant]);
    const job = jobById.get(jobId);
    return {
      ...applicant,
      jobId,
      jobTitle,
      match: job ? computeMatchScore(job, applicant.talent) : null,
    };
  });

  return { byJobId, all };
};

// Used to be N parallel GET /employer/jobs/:id/applications requests (one
// per job with any applicants, via useQueries) merged client-side — an
// employer with N active listings paid N full request/auth/DB round trips
// just to render the dashboard's "Recent applicants" panel. Now one
// GET /employer/applications/recent call returns the same company-wide
// activity feed directly (see EmployerRepository.findRecentApplicationsForCompany).
// jobs (from the already-single-request useEmployerJobs) is still needed
// for match scoring — computeMatchScore needs the full job (skills, salary,
// level, timezone), which the recent-applications response deliberately
// doesn't duplicate per row.
export const useEmployerApplicationsAggregate = () => {
  const { data: jobsData } = useEmployerJobs();
  const jobs = jobsData?.jobs ?? [];

  const {
    data,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch: refetchAll,
  } = useQuery({
    queryKey: employerKeys.recentApplications(),
    // Same 403/404-is-not-an-error catch as useEmployerProfile/
    // useEmployerJobs above, for the same company-less-employer case —
    // this endpoint hits the same COMPANY_MEMBERSHIP_REQUIRED 403.
    queryFn: async ({ signal }) => {
      try {
        return await listRecentApplications({ signal });
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
    ...TIER.live,
  });

  const { byJobId, all } = useMemo(
    () => buildApplicantsAggregate(jobs, data?.applications ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataUpdatedAt, jobs]
  );

  return {
    isLoading,
    isError,
    applications: all,
    byJobId,
    refetchAll,
  };
};

// Fetches the CSV and immediately saves it — no cached "data" here worth a
// useQuery, same one-off-download shape as
// interview.queries.ts's useDownloadInterviewIcs.
export const useExportJobApplicantsCsv = () =>
  useMutation({
    mutationFn: async ({
      jobId,
      jobTitle,
    }: {
      jobId: string;
      jobTitle: string;
    }) => {
      const blob = await exportJobApplicantsCsv(jobId);
      // Matches non-alphanumeric runs to a single dash — a job title is
      // free text (could contain "/", quotes, emoji) and any of those would
      // otherwise either break the filename or get silently stripped by
      // the browser's own save-as sanitization.
      const safeTitle = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      downloadBlob(blob, `applicants-${safeTitle}.csv`);
    },
  });

export const useHiringFunnel = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: employerKeys.funnel(),
    // Same 403/404-is-not-an-error catch as the other employer-dashboard
    // queries above — a company-less EMPLOYER hits the same
    // COMPANY_MEMBERSHIP_REQUIRED 403 here.
    queryFn: async ({ signal }) => {
      try {
        return await getHiringFunnel({ signal });
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

// Backs the dashboard screen with one request instead of the four
// (useEmployerProfile/useEmployerJobs/useEmployerApplicationsAggregate/
// useHiringFunnel each firing separately — see GET /employer/dashboard).
// Also seeds each of those four queries' own caches on success, so any of
// those hooks — used independently elsewhere, e.g. TalentSearchBoard's
// useEmployerJobs or ApplicationWorkspacePage's
// useEmployerApplicationsAggregate — gets an instant cache hit instead of
// re-fetching if the user navigates there next, within TIER.live's
// staleness window.
export const useEmployerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: employerKeys.dashboard(),
    queryFn: async ({ signal }) => {
      const dashboard = await getEmployerDashboard({ signal });
      queryClient.setQueryData(employerKeys.profile(), dashboard.profile);
      queryClient.setQueryData(employerKeys.jobs(), dashboard.jobs);
      queryClient.setQueryData(
        employerKeys.recentApplications(),
        dashboard.recentApplications
      );
      queryClient.setQueryData(employerKeys.funnel(), dashboard.funnel);
      return dashboard;
    },
    enabled: !!user && user.role === "EMPLOYER",
    ...TIER.live,
  });

  const { byJobId, all } = useMemo(
    () =>
      buildApplicantsAggregate(
        data?.jobs?.jobs ?? [],
        data?.recentApplications?.applications ?? []
      ),
    [data]
  );

  return {
    profile: data?.profile ?? null,
    jobs: data?.jobs ?? null,
    applications: all,
    byJobId,
    funnel: data?.funnel ?? null,
    isLoading,
    isError,
    refetch,
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
      // The dashboard's "Recent applicants" panel reads this key now (see
      // useEmployerApplicationsAggregate), not a per-job key — without this
      // it kept showing the pre-update status until the next unrelated
      // refetch.
      queryClient.invalidateQueries({
        queryKey: employerKeys.recentApplications(),
      });
      queryClient.invalidateQueries({
        queryKey: employerKeys.jobs(),
      });
      queryClient.invalidateQueries({
        queryKey: MY_APPLICATIONS_KEY,
      });
      // EmployerDashboard now sources its own applicants panel from
      // useEmployerDashboard's aggregate snapshot (GET /employer/dashboard),
      // not employerKeys.recentApplications()/jobs() directly — without
      // this, a status change made from that same dashboard's
      // ApplicantsPanel left the snapshot showing the pre-update status
      // until its next unrelated refetch.
      queryClient.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
  });
};

// Multi-job generalization of useUpdateApplicationStatus's invalidation —
// a bulk selection in "Recent applicants" can span several jobs at once,
// so every affected job's application cache needs invalidating, not just one.
export const useBulkUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      items,
      status,
      notes,
    }: {
      items: { id: string; jobId: string }[];
      status: ApplicationStatus;
      notes?: string;
    }) =>
      bulkUpdateApplicationStatus(
        items.map((i) => i.id),
        status,
        notes
      ),
    onSuccess: (_data, { items }) => {
      const jobIds = new Set(items.map((i) => i.jobId));
      jobIds.forEach((jobId) => {
        queryClient.invalidateQueries({
          queryKey: employerKeys.jobApplications(jobId),
        });
      });
      // Same reasoning as useUpdateApplicationStatus's own comment — a
      // single key for the whole company-wide feed, not per-job.
      queryClient.invalidateQueries({
        queryKey: employerKeys.recentApplications(),
      });
      queryClient.invalidateQueries({
        queryKey: employerKeys.jobs(),
      });
      queryClient.invalidateQueries({
        queryKey: MY_APPLICATIONS_KEY,
      });
      // Same reasoning as useUpdateApplicationStatus's own comment above.
      queryClient.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
  });
};

export const useSubmitEmployerVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitEmployerVerification,
    onSuccess: () => {
      // Flips verificationStatus to PENDING — the dashboard's "Verify your
      // company" card reads that off the same profile query. It also reads
      // from useEmployerDashboard's own aggregate snapshot now, hence the
      // second invalidation below (same reasoning as
      // useUpdateApplicationStatus's own comment).
      queryClient.invalidateQueries({ queryKey: employerKeys.profile() });
      queryClient.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
  });
};

export const useConfirmEmployerVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmEmployerVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employerKeys.profile() });
      queryClient.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
  });
};

export const usePublicCompanyProfile = (slug: string | undefined) =>
  useQuery({
    queryKey: employerKeys.public(slug),
    queryFn: ({ signal }) =>
      getPublicCompanyProfile(slug as string, { signal }),
    enabled: !!slug,
  });
