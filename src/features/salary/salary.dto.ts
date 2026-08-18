export type SalaryBenchmarkDto = {
  role: string;
  min: number;
  max: number;
  mid: number;
  count: number;
};

export type SalaryBenchmarkBySeniorityDto = SalaryBenchmarkDto & {
  level: string;
};

export type SalaryBenchmarkByCountryDto = {
  country: string;
  min: number;
  max: number;
  mid: number;
  count: number;
};
