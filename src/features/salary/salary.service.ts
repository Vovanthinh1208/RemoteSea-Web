import type { RequestOptions } from "@/core/http/request-config";
import { salaryRepository } from "@/features/salary/salary.repository";
import { toSalaryBenchmark, type SalaryBenchmark } from "@/features/salary/salary.mapper";

export type { SalaryBenchmark };

export const listSalaryBenchmarks = async (opts?: RequestOptions): Promise<SalaryBenchmark[]> =>
  (await salaryRepository.listBenchmarks(opts)).map(toSalaryBenchmark);
