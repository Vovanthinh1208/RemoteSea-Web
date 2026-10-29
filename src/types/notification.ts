export type NotificationType =
  | "INVITATION_RECEIVED"
  | "APPLICATION_STATUS_CHANGED"
  | "JOB_REPORT_RESOLVED"
  | "MESSAGE_RECEIVED"
  | "INTERVIEW_PROPOSED"
  | "INTERVIEW_CONFIRMED"
  | "APPLICATION_WITHDRAWN"
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
  | "INTERVIEW_CANCELLED"
  // PB73: the employer side's "new application" event.
  | "APPLICATION_RECEIVED";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};
