import type { RequestOptions } from "@/core/http/request-config";
import { applicationsRepository } from "@/features/applications/applications.repository";
import { toApplication, toApplicationWithJob } from "@/features/applications/applications.mapper";
import type { ApplyRequestDto } from "@/features/applications/applications.dto";
import type { Application, ApplicationWithJob } from "@/types/application";

export type ApplyPayload = ApplyRequestDto;

export const applyToJob = async (payload: ApplyPayload): Promise<Application> =>
  toApplication(await applicationsRepository.apply(payload));

export const listMyApplications = async (opts?: RequestOptions): Promise<ApplicationWithJob[]> =>
  (await applicationsRepository.listMine(opts)).map(toApplicationWithJob);
