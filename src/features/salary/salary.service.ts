import type { RequestOptions } from "@/core/http/request-config";
import { salaryRepository } from "@/features/salary/salary.repository";
import {
  toSalaryBenchmark,
  toSalaryBenchmarkByCountry,
  toSalaryBenchmarkBySeniority,
  type SalaryBenchmark,
  type SalaryBenchmarkByCountry,
  type SalaryBenchmarkBySeniority,
} from "@/features/salary/salary.mapper";

export type {
  SalaryBenchmark,
  SalaryBenchmarkBySeniority,
  SalaryBenchmarkByCountry,
};

export const listSalaryBenchmarks = async (
  opts?: RequestOptions
): Promise<SalaryBenchmark[]> =>
  (await salaryRepository.listBenchmarks(opts)).map(toSalaryBenchmark);

export const listSalaryBenchmarksBySeniority = async (
  opts?: RequestOptions
): Promise<SalaryBenchmarkBySeniority[]> =>
  (await salaryRepository.listBenchmarksBySeniority(opts)).map(
    toSalaryBenchmarkBySeniority
  );

export const listSalaryBenchmarksByCountry = async (
  opts?: RequestOptions
): Promise<SalaryBenchmarkByCountry[]> =>
  (await salaryRepository.listBenchmarksByCountry(opts)).map(
    toSalaryBenchmarkByCountry
  );
