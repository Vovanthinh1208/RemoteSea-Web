import { apiClient } from "@/core/http/http-client";
import type { RequestOptions } from "@/core/http/request-config";
import type {
  SalaryBenchmarkByCountryDto,
  SalaryBenchmarkBySeniorityDto,
  SalaryBenchmarkDto,
} from "@/features/salary/salary.dto";

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

  listBenchmarksBySeniority: async (
    opts?: RequestOptions
  ): Promise<SalaryBenchmarkBySeniorityDto[]> => {
    const { data } = await apiClient.get<SalaryBenchmarkBySeniorityDto[]>(
      "/salary/benchmarks/by-seniority",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },

  listBenchmarksByCountry: async (
    opts?: RequestOptions
  ): Promise<SalaryBenchmarkByCountryDto[]> => {
    const { data } = await apiClient.get<SalaryBenchmarkByCountryDto[]>(
      "/salary/benchmarks/by-country",
      {
        signal: opts?.signal,
      }
    );
    return data;
  },
};
