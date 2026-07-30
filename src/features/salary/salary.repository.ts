import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type { SalaryBenchmarkDto } from "@/features/salary/salary.dto";

export const salaryRepository = {
  listBenchmarks: async (
    opts?: RequestOptions
  ): Promise<SalaryBenchmarkDto[]> => {
    const { data } = await apiClient.get<SalaryBenchmarkDto[]>(
      "/salary/benchmarks",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },
};
