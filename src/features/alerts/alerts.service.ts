import type { RequestOptions } from "@/core/http/request-config";
import { alertsRepository } from "@/features/alerts/alerts.repository";
import { toJobAlert } from "@/features/alerts/alerts.mapper";
import type { CreateAlertPayload, JobAlert } from "@/types/alert";

export const listAlerts = async (opts?: RequestOptions): Promise<JobAlert[]> =>
  (await alertsRepository.list(opts)).map(toJobAlert);

export const createAlert = async (payload: CreateAlertPayload): Promise<JobAlert> =>
  toJobAlert(await alertsRepository.create(payload));

export const setAlertActive = async (id: string, isActive: boolean): Promise<JobAlert> =>
  toJobAlert(await alertsRepository.setActive(id, isActive));

export const deleteAlert = async (id: string): Promise<void> => alertsRepository.delete(id);
