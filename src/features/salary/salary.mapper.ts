import type {
  SalaryBenchmarkByCountryDto,
  SalaryBenchmarkBySeniorityDto,
  SalaryBenchmarkDto,
} from "@/features/salary/salary.dto";

export type SalaryBenchmark = SalaryBenchmarkDto;
export type SalaryBenchmarkBySeniority = SalaryBenchmarkBySeniorityDto;
export type SalaryBenchmarkByCountry = SalaryBenchmarkByCountryDto;

export const toSalaryBenchmark = (dto: SalaryBenchmarkDto): SalaryBenchmark =>
  dto;
export const toSalaryBenchmarkBySeniority = (
  dto: SalaryBenchmarkBySeniorityDto
): SalaryBenchmarkBySeniority => dto;
export const toSalaryBenchmarkByCountry = (
  dto: SalaryBenchmarkByCountryDto
): SalaryBenchmarkByCountry => dto;
