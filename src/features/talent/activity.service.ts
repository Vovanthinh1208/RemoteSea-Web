import type { RequestOptions } from "@/core/http/request-config";
import { activityRepository } from "@/features/talent/activity.repository";
import { toActivityList } from "@/features/talent/activity.mapper";
import type { ActivityItem } from "@/types/activity";

export const listActivity = async (
  opts?: RequestOptions
): Promise<ActivityItem[]> =>
  toActivityList(await activityRepository.list(opts));
