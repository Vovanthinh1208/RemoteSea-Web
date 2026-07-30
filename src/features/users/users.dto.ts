import type { AuthUser } from "@/types/user";

export type UpdatedUserDto = Pick<AuthUser, "id" | "name" | "email">;
export type ChangePasswordRequestDto = {
  currentPassword: string;
  newPassword: string;
};

export type AccountFieldsDto = {
  id: string;
  phone: string | null;
  language: string;
  region: string;
  currencyDisplay: string;
  image: string | null;
};

export type UpdateAccountPayload = Partial<{
  phone: string;
  language: string;
  region: string;
  currencyDisplay: string;
  image: string | null;
}>;

export type NotificationPreferencesDto = {
  id: string;
  userId: string;
  applicationUpdates: boolean;
  employerMessages: boolean;
  weeklyDigest: boolean;
  instantMatchAlerts: boolean;
  productNews: boolean;
  tipsAndResources: boolean;
  browserPush: boolean;
  updatedAt: string;
};

export type UpdateNotificationPreferencesPayload = Partial<
  Omit<NotificationPreferencesDto, "id" | "userId" | "updatedAt">
>;

export type PauseStateDto = {
  isPaused: boolean;
  pausedAt?: string | null;
};

export type ConnectionDto = {
  provider: string;
  providerAccountId: string;
};

export type ExportDataDto = {
  exportedAt: string;
  account: Record<string, unknown>;
};

export type SessionDto = {
  id: string;
  device: string;
  ip: string | null;
  location: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
};

export type RevokeOtherSessionsResponseDto = { revokedCount: number };
