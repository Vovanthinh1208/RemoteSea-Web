import type { SupportedLocale } from "@/i18n/types";
import type { Notification } from "@/types/notification";

type Translate = (
  key: string,
  params?: Record<string, string | number>
) => string;

// remotesea-api stores notifications as rendered English sentences (no
// structured params), so the Vietnamese UI rebuilds them from the known
// templates (see remotesea-api notifications.service callers and prisma seed).
// Only the template wording is translated; the job title, company and person
// names and message previews inside them are user content and stay as-is.
// Anything that does not match a known template is shown unchanged.

const STATUS_BY_LABEL: Record<string, string> = {
  // APPLICATION_STATUS_LABELS in remotesea-api employer/constants.ts
  pending: "PENDING",
  "in review": "REVIEWING",
  shortlisted: "SHORTLISTED",
  interview: "INTERVIEW",
  "offer extended": "OFFERED",
  "offer accepted": "OFFER_ACCEPTED",
  "offer declined": "OFFER_DECLINED",
  rejected: "REJECTED",
  withdrawn: "WITHDRAWN",
  // wording used by the seed data
  offered: "OFFERED",
  reviewing: "REVIEWING",
};

const match = (text: string | null, pattern: RegExp) =>
  text ? pattern.exec(text.trim()) : null;

type Localized = { title: string; body: string | null };

const localizeVi = (n: Notification, t: Translate): Localized | null => {
  switch (n.type) {
    case "MESSAGE_RECEIVED": {
      const about = match(n.title, /^New message about (.+)$/);
      if (about)
        return {
          title: t("notifications.tpl.message.titleAbout", { job: about[1] }),
          body: n.body,
        };
      if (n.title.trim() === "New message")
        return { title: t("notifications.tpl.message.title"), body: n.body };
      return null;
    }
    case "APPLICATION_STATUS_CHANGED": {
      const body = match(n.body, /^Your application for (.+) is now (.+?)\.$/);
      const status = body && STATUS_BY_LABEL[body[2].toLowerCase()];
      if (!body || !status) return null;
      return {
        title: t("notifications.tpl.status.title"),
        body: t("notifications.tpl.status.body", {
          job: body[1],
          status: t(`talent.stage.${status}`),
        }),
      };
    }
    case "JOB_REPORT_RESOLVED": {
      const body = match(
        n.body,
        /^Your report on "(.+)" has been (resolved|dismissed)\.$/
      );
      if (!body) return null;
      const outcome = body[2] as "resolved" | "dismissed";
      return {
        title: t(`notifications.tpl.report.${outcome}Title`),
        body: t(`notifications.tpl.report.${outcome}Body`, { job: body[1] }),
      };
    }
    case "INTERVIEW_PROPOSED": {
      const title = match(n.title, /^(.+) proposed interview times$/);
      const body = match(
        n.body,
        /^(\d+) option(?:\(s\)|s)? for a (\d+)-min interview for (.+)\.$/
      );
      if (!title || !body) return null;
      return {
        title: t("notifications.tpl.interviewProposed.title", {
          company: title[1],
        }),
        body: t("notifications.tpl.interviewProposed.body", {
          count: Number(body[1]),
          minutes: Number(body[2]),
          job: body[3],
        }),
      };
    }
    case "INTERVIEW_CONFIRMED": {
      const body = match(n.body, /^(.+) confirmed the interview for (.+)\.$/);
      if (n.title.trim() !== "Interview confirmed" || !body) return null;
      const name =
        body[1] === "The candidate"
          ? t("notifications.tpl.interviewConfirmed.someone")
          : body[1];
      return {
        title: t("notifications.tpl.interviewConfirmed.title"),
        body: t("notifications.tpl.interviewConfirmed.body", {
          name,
          job: body[2],
        }),
      };
    }
    case "INVITATION_RECEIVED": {
      const title = match(n.title, /^(.+) invited you to apply$/);
      const body = match(n.body, /^You've been invited to apply for (.+)\.$/);
      if (!title || !body) return null;
      return {
        title: t("notifications.tpl.invitation.title", { company: title[1] }),
        body: t("notifications.tpl.invitation.body", { job: body[1] }),
      };
    }
    default:
      return null;
  }
};

/** The notification's title and body in the active locale. */
export const localizeNotification = (
  n: Notification,
  locale: SupportedLocale,
  t: Translate
): Localized => {
  if (locale === "vi") {
    const localized = localizeVi(n, t);
    if (localized) return localized;
  }
  return { title: n.title, body: n.body };
};

// ── Talent dashboard activity feed ────────────────────────────────────────
// Same idea for remotesea-api talent/activity.util.ts, whose bodies are built
// from `${job.title} at ${companyName}`.

type ActivityLike = Pick<Notification, "type" | "title" | "body">;

const jobLine = (text: string, t: Translate): string | null => {
  const at = text.lastIndexOf(" at ");
  if (at <= 0) return null;
  return t("notifications.tpl.activity.jobLine", {
    job: text.slice(0, at),
    company: text.slice(at + 4),
  });
};

const localizeActivityVi = (
  a: ActivityLike,
  t: Translate
): Localized | null => {
  const body = a.body?.trim() ?? "";
  switch (a.type) {
    case "APPLICATION_STATUS_CHANGED": {
      const status = STATUS_BY_LABEL[a.title.trim().toLowerCase()];
      const line = jobLine(body, t);
      return status && line
        ? { title: t(`talent.stage.${status}`), body: line }
        : null;
    }
    case "MESSAGE_RECEIVED": {
      const m = /^([\s\S]+?): "([\s\S]*)"$/.exec(body);
      const line = m && jobLine(m[1], t);
      if (a.title.trim() !== "New message" || !m || !line) return null;
      return {
        title: t("notifications.tpl.message.title"),
        body: `${line}: “${m[2]}”`,
      };
    }
    case "INTERVIEW_PROPOSED":
    case "INTERVIEW_CONFIRMED": {
      const expected =
        a.type === "INTERVIEW_PROPOSED"
          ? "Interview proposed"
          : "Interview confirmed";
      const line = jobLine(body, t);
      if (a.title.trim() !== expected || !line) return null;
      return {
        title: t(
          a.type === "INTERVIEW_PROPOSED"
            ? "notifications.tpl.activity.interviewProposed"
            : "notifications.tpl.interviewConfirmed.title"
        ),
        body: line,
      };
    }
    case "INVITATION_RECEIVED": {
      const m = /^(.+) at (.+) invited you to apply$/.exec(body);
      if (a.title.trim() !== "Job invitation" || !m) return null;
      return {
        title: t("notifications.tpl.activity.invitationTitle"),
        body: t("notifications.tpl.invitation.bodyFrom", {
          job: m[1],
          company: m[2],
        }),
      };
    }
    default:
      return null;
  }
};

/** An activity feed item's title and body in the active locale. */
export const localizeActivity = (
  a: ActivityLike,
  locale: SupportedLocale,
  t: Translate
): Localized => {
  if (locale === "vi") {
    const localized = localizeActivityVi(a, t);
    if (localized) return localized;
  }
  return { title: a.title, body: a.body };
};
