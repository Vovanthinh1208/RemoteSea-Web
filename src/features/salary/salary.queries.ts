import { useQuery } from "@tanstack/react-query";
import { listSalaryBenchmarks } from "@/features/salary/salary.service";
import { salaryKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

export const useSalaryBenchmarks = () =>
  useQuery({
    queryKey: salaryKeys.benchmarks(),
    queryFn: ({ signal }) => listSalaryBenchmarks({ signal }),
    ...TIER.reference,
  });

// Public surface for the domain type too — cross-feature consumers import
// from here, not from the feature's inner service/api layers.
export type { SalaryBenchmark } from "@/features/salary/salary.service";
