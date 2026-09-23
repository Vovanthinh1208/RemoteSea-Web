import type { TalentProfile, UpdateTalentProfilePayload } from "@/types/talent";
import type {
  ApplicationListResponseDto,
  ApplicationStatusCountsDto,
} from "@/features/applications/applications.dto";
import type { JobAlertDto } from "@/features/alerts/alerts.dto";
import type { InvitationDto } from "@/features/invitations/invitations.dto";
import type { ActivityItemDto } from "@/features/talent/activity.dto";

export type TalentProfileDto = TalentProfile;
export type UpdateTalentProfileRequestDto = UpdateTalentProfilePayload;

export type SubmitVerificationRequestDto = { email: string };
export type SubmitVerificationResponseDto = { message: string };
export type ConfirmVerificationRequestDto = { token: string };
export type ConfirmVerificationResponseDto = { message: string };

export type ProfileViewAnalyticsDto = {
  totalViews: number;
  uniqueViewers: number;
};

// GET /talent/me/dashboard — combines the profile/applications/saved-ids/
// profile-views/alerts/invitations/activity reads above into one response.
// Every field is independently nullable: `profile` is null for a caller
// with no talent profile yet (mirrors GET /talent/me's own 404 for that
// case); every other field already degrades to an empty list/zero-value
// result on its own for that same case (see TalentService.getDashboard).
export type TalentDashboardResponseDto = {
  profile: TalentProfileDto | null;
  applications: ApplicationListResponseDto | null;
  applicationStats: ApplicationStatusCountsDto | null;
  savedJobIds: string[] | null;
  profileViewAnalytics: ProfileViewAnalyticsDto | null;
  alerts: JobAlertDto[] | null;
  invitations: InvitationDto[] | null;
  activity: ActivityItemDto[] | null;
};
