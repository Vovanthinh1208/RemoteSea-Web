export type ActivityItemType =
  | "APPLICATION_STATUS_CHANGED"
  | "MESSAGE_RECEIVED"
  | "INTERVIEW_PROPOSED"
  | "INTERVIEW_CONFIRMED"
  | "INVITATION_RECEIVED";

// Computed at request time from ApplicationStatusEvent/Message/Interview/
// JobInvitation (GET /talent/me/activity) — no persisted row, so unlike
// Notification there's no readAt.
export type ActivityItem = {
  id: string;
  type: ActivityItemType;
  title: string;
  body: string | null;
  link: string;
  createdAt: string;
};
