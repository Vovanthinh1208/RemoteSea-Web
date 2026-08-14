import type { SalaryBenchmarkDto } from "@/features/salary/salary.dto";

export type SalaryBenchmark = SalaryBenchmarkDto;

export const toSalaryBenchmark = (dto: SalaryBenchmarkDto): SalaryBenchmark =>
  dto;
