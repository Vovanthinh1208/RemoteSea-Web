import type {
  ProfileViewAnalyticsDto,
  TalentDashboardResponseDto,
  TalentProfileDto,
} from "@/features/talent/talent.dto";
import type { TalentProfile } from "@/types/talent";
import {
  toApplicationListResponse,
  toApplicationStatusCounts,
  type ApplicationListResponse,
  type ApplicationStatusCounts,
} from "@/features/applications/applications.mapper";
import { toJobAlert } from "@/features/alerts/alerts.mapper";
import { toInvitations } from "@/features/invitations/invitations.mapper";
import { toActivityItem } from "@/features/talent/activity.mapper";
import type { JobAlert } from "@/types/alert";
import type { Invitation } from "@/types/invitation";
import type { ActivityItem } from "@/types/activity";

export const toTalentProfile = (dto: TalentProfileDto): TalentProfile => dto;

export type TalentDashboardResponse = {
  profile: TalentProfile | null;
  applications: ApplicationListResponse | null;
  applicationStats: ApplicationStatusCounts | null;
  savedJobIds: string[] | null;
  profileViewAnalytics: ProfileViewAnalyticsDto | null;
  alerts: JobAlert[] | null;
  invitations: Invitation[] | null;
  activity: ActivityItem[] | null;
};

export const toTalentDashboardResponse = (
  dto: TalentDashboardResponseDto
): TalentDashboardResponse => ({
  profile: dto.profile ? toTalentProfile(dto.profile) : null,
  applications: dto.applications
    ? toApplicationListResponse(dto.applications)
    : null,
  applicationStats: dto.applicationStats
    ? toApplicationStatusCounts(dto.applicationStats)
    : null,
  savedJobIds: dto.savedJobIds,
  profileViewAnalytics: dto.profileViewAnalytics,
  alerts: dto.alerts ? dto.alerts.map(toJobAlert) : null,
  invitations: dto.invitations ? toInvitations(dto.invitations) : null,
  activity: dto.activity ? dto.activity.map(toActivityItem) : null,
});
