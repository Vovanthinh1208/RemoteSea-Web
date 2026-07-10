import type {
  ApplicationDto,
  ApplicationWithJobDto,
} from "@/features/applications/applications.dto";
import type { Application, ApplicationWithJob } from "@/types/application";

export const toApplication = (dto: ApplicationDto): Application => dto;
export const toApplicationWithJob = (dto: ApplicationWithJobDto): ApplicationWithJob => dto;
