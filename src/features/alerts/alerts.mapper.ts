import type { JobAlertDto } from "@/features/alerts/alerts.dto";
import type { JobAlert } from "@/types/alert";

export const toJobAlert = (dto: JobAlertDto): JobAlert => dto;
