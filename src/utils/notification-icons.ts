import {
  ArrowUpRight,
  CalendarClock,
  Flag,
  Mail,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types/notification";

// Shared by NotificationRow, NotificationBell, and ActivityFeed — both
// surfaces render (a subset of) the same underlying event types, so the
// icon a talent sees for "interview proposed" is the same wherever it
// appears. Keyed by the superset (NotificationType); ActivityItemType is a
// strict subset, so indexing with either type checks.
export const EVENT_ICON: Record<NotificationType, LucideIcon> = {
  APPLICATION_STATUS_CHANGED: ArrowUpRight,
  MESSAGE_RECEIVED: MessageCircle,
  INTERVIEW_PROPOSED: CalendarClock,
  INTERVIEW_CONFIRMED: CalendarClock,
  INVITATION_RECEIVED: Mail,
  JOB_REPORT_RESOLVED: Flag,
};

export const EVENT_BULLET_CLASS: Record<NotificationType, string> = {
  APPLICATION_STATUS_CHANGED:
    "bg-amber-50 text-amber-600 border border-amber-100",
  MESSAGE_RECEIVED: "bg-brand-50 text-brand-600 border border-brand-100",
  INTERVIEW_PROPOSED: "bg-brand-50 text-brand-600 border border-brand-100",
  INTERVIEW_CONFIRMED: "bg-brand-50 text-brand-600 border border-brand-100",
  INVITATION_RECEIVED: "bg-neutral-100 text-neutral-400",
  JOB_REPORT_RESOLVED:
    "bg-neutral-100 text-neutral-500 border border-neutral-200",
};
