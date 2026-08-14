import { Dropdown } from "@/components/ui/dropdown";
import type { EmployerJobListItem } from "@/types/employer";

const NO_JOB_VALUE = "";

interface JobContextSelectProps {
  jobs: EmployerJobListItem[];
  value: string | undefined;
  onChange: (jobId: string | undefined) => void;
}

/**
 * Lets an employer pick one of their own ACTIVE jobs to badge/sort the
 * current page of search results against — see match.util.ts's client-side
 * scoring and talent-search.filters.ts's `forJob` for why this never reaches
 * the API.
 */
export const JobContextSelect = ({
  jobs,
  value,
  onChange,
}: JobContextSelectProps) => {
  const options = [
    { value: NO_JOB_VALUE, label: "All candidates" },
    ...jobs.map((job) => ({ value: job.id, label: job.title })),
  ];

  return (
    <Dropdown
      aria-label="Rank against a job"
      options={options}
      value={value ?? NO_JOB_VALUE}
      onChange={(v) => onChange(v === NO_JOB_VALUE ? undefined : v)}
    />
  );
};
