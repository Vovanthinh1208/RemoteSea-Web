import type {
  ActivityItemDto,
  ListActivityResponseDto,
} from "@/features/talent/activity.dto";
import type { ActivityItem } from "@/types/activity";

export const toActivityItem = (dto: ActivityItemDto): ActivityItem => dto;

export const toActivityList = (dto: ListActivityResponseDto): ActivityItem[] =>
  dto.activity.map(toActivityItem);
