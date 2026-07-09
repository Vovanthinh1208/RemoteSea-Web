import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createJob, getJob, listJobs } from "@/features/jobs/jobs.api";
import { JOB_LIMIT, type JobFilters } from "@/features/jobs/job-filters";
import { EMPLOYER_JOBS_KEY } from "@/features/employer/employer.queries";

export const useJobsQuery = (filters: JobFilters, limit: number = JOB_LIMIT) =>
  useQuery({
    queryKey: ["jobs", filters, limit],
    queryFn: () => listJobs(filters, limit),
    placeholderData: keepPreviousData,
  });

export const useJobQuery = (id: string | undefined) =>
  useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id as string),
    enabled: !!id,
  });

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      // Without this, a newly-posted job can be missing from the employer's own
      // dashboard (if it was cached earlier this session) for up to staleTime.
      queryClient.invalidateQueries({ queryKey: EMPLOYER_JOBS_KEY });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};
