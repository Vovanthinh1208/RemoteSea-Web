export type NotificationType =
  "INVITATION_RECEIVED" | "APPLICATION_STATUS_CHANGED" | "JOB_REPORT_RESOLVED";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};
