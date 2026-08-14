import { useQuery } from "@tanstack/react-query";
import {
  listSalaryBenchmarks,
  listSalaryBenchmarksByCountry,
  listSalaryBenchmarksBySeniority,
} from "@/features/salary/salary.service";
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

export const useSalaryBenchmarksBySeniority = (enabled = true) =>
  useQuery({
    queryKey: salaryKeys.benchmarksBySeniority(),
    queryFn: ({ signal }) => listSalaryBenchmarksBySeniority({ signal }),
    enabled,
    ...TIER.reference,
  });

export const useSalaryBenchmarksByCountry = (enabled = true) =>
  useQuery({
    queryKey: salaryKeys.benchmarksByCountry(),
    queryFn: ({ signal }) => listSalaryBenchmarksByCountry({ signal }),
    enabled,
    ...TIER.reference,
  });

// Public surface for the domain type too — cross-feature consumers import
// from here, not from the feature's inner service/api layers.
export type {
  SalaryBenchmark,
  SalaryBenchmarkBySeniority,
  SalaryBenchmarkByCountry,
} from "@/features/salary/salary.service";
