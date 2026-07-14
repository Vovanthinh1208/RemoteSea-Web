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
