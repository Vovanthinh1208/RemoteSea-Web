import { useQuery } from "@tanstack/react-query";
import { listSalaryBenchmarks } from "@/features/salary/salary.service";
import { salaryKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

// `enabled` lets callers that only need benchmarks conditionally (e.g. the job
// detail's salary card, meaningless for a job with no salary) skip the fetch.
export const useSalaryBenchmarks = (enabled = true) =>
  useQuery({
    queryKey: salaryKeys.benchmarks(),
    queryFn: ({ signal }) => listSalaryBenchmarks({ signal }),
    enabled,
    ...TIER.reference,
  });

// Public surface for the domain type too — cross-feature consumers import
// from here, not from the feature's inner service/api layers.
export type { SalaryBenchmark } from "@/features/salary/salary.service";
