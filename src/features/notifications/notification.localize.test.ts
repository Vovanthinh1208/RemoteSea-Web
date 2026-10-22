import { describe, expect, it } from "vitest";
import { hasTranslation, resolveTranslation } from "@/i18n/translate";
import type { Notification, NotificationType } from "@/types/notification";
import {
  localizeActivity,
  localizeNotification,
} from "@/features/notifications/notification.localize";

// Same scoping as useTranslation("notifications").
const tFor =
  (locale: "en" | "vi") =>
  (key: string, params?: Record<string, string | number>) =>
    resolveTranslation(
      locale,
      hasTranslation("en", `notifications.${key}`)
        ? `notifications.${key}`
        : key,
      params
    );

const n = (
  type: NotificationType,
  title: string,
  body: string | null
): Notification => ({
  id: "n1",
  type,
  title,
  body,
  link: null,
  readAt: null,
  createdAt: "2026-10-01T00:00:00Z",
});

const vi = (x: Notification) => localizeNotification(x, "vi", tFor("vi"));

describe("localizeNotification (strings as remotesea-api renders them)", () => {
  it("message received", () => {
    expect(
      vi(
        n(
          "MESSAGE_RECEIVED",
          "New message about Senior Backend Engineer",
          "Hi Mai — thanks!"
        )
      )
    ).toEqual({
      title: "Tin nhắn mới về vị trí Senior Backend Engineer",
      body: "Hi Mai — thanks!", // the message itself is user content
    });
    expect(vi(n("MESSAGE_RECEIVED", "New message", "See you")).title).toBe(
      "Tin nhắn mới"
    );
  });

  it("application status changed, for API labels and seed wording", () => {
    expect(
      vi(
        n(
          "APPLICATION_STATUS_CHANGED",
          "Your application status changed",
          "Your application for Product Owner is now Offer extended."
        )
      )
    ).toEqual({
      title: "Trạng thái đơn ứng tuyển của bạn đã thay đổi",
      body: "Đơn ứng tuyển vị trí Product Owner của bạn hiện ở trạng thái: Đã nhận offer.",
    });
    expect(
      vi(
        n(
          "APPLICATION_STATUS_CHANGED",
          "Your application status changed",
          "Your application for Data Analyst is now In review."
        )
      ).body
    ).toBe(
      "Đơn ứng tuyển vị trí Data Analyst của bạn hiện ở trạng thái: Đang xem xét."
    );
    expect(
      vi(
        n(
          "APPLICATION_STATUS_CHANGED",
          "Your application status changed",
          "Your application for X is now Offered."
        )
      ).body
    ).toContain("Đã nhận offer");
  });

  it("job report resolved / dismissed", () => {
    expect(
      vi(
        n(
          "JOB_REPORT_RESOLVED",
          "Your report was resolved",
          'Your report on "Scam job" has been resolved.'
        )
      )
    ).toEqual({
      title: "Báo cáo của bạn đã được xử lý",
      body: "Báo cáo của bạn về tin “Scam job” đã được xử lý.",
    });
    expect(
      vi(
        n(
          "JOB_REPORT_RESOLVED",
          "Your report was dismissed",
          'Your report on "Ok job" has been dismissed.'
        )
      ).title
    ).toBe("Báo cáo của bạn đã bị bác bỏ");
  });

  it("interview proposed, confirmed and invitations", () => {
    expect(
      vi(
        n(
          "INTERVIEW_PROPOSED",
          "Mekong Digital proposed interview times",
          "3 option(s) for a 45-min interview for Senior Backend Engineer."
        )
      )
    ).toEqual({
      title: "Mekong Digital đã đề xuất lịch phỏng vấn",
      body: "3 khung giờ cho buổi phỏng vấn 45 phút vị trí Senior Backend Engineer.",
    });
    expect(
      vi(
        n(
          "INTERVIEW_PROPOSED",
          "Acme proposed interview times",
          "1 option for a 30-min interview for QA."
        )
      ).body
    ).toBe("1 khung giờ cho buổi phỏng vấn 30 phút vị trí QA.");
    expect(
      vi(
        n(
          "INTERVIEW_CONFIRMED",
          "Interview confirmed",
          "The candidate confirmed the interview for QA."
        )
      ).body
    ).toBe("Ứng viên đã xác nhận buổi phỏng vấn vị trí QA.");
    expect(
      vi(
        n(
          "INVITATION_RECEIVED",
          "Acme invited you to apply",
          "You've been invited to apply for Go Engineer."
        )
      )
    ).toEqual({
      title: "Acme mời bạn ứng tuyển",
      body: "Bạn được mời ứng tuyển vị trí Go Engineer.",
    });
  });

  it("shows unknown wording unchanged instead of guessing", () => {
    const odd = n(
      "APPLICATION_STATUS_CHANGED",
      "Something new",
      "A sentence the client does not know."
    );
    expect(vi(odd)).toEqual({
      title: "Something new",
      body: "A sentence the client does not know.",
    });
    const unknownStatus = n(
      "APPLICATION_STATUS_CHANGED",
      "Your application status changed",
      "Your application for X is now Teleported."
    );
    expect(vi(unknownStatus).body).toBe(
      "Your application for X is now Teleported."
    );
  });

  it("leaves English untouched", () => {
    const x = n(
      "INVITATION_RECEIVED",
      "Acme invited you to apply",
      "You've been invited to apply for Go Engineer."
    );
    expect(localizeNotification(x, "en", tFor("en"))).toEqual({
      title: x.title,
      body: x.body,
    });
  });
});

describe("localizeActivity (talent/activity.util.ts strings)", () => {
  const a = (type: NotificationType, title: string, body: string) =>
    localizeActivity({ type, title, body }, "vi", tFor("vi"));

  it("status, message, interview and invitation items", () => {
    expect(
      a(
        "APPLICATION_STATUS_CHANGED",
        "Offer extended",
        "Senior Backend Engineer at Mekong Digital"
      )
    ).toEqual({
      title: "Đã nhận offer",
      body: "Senior Backend Engineer tại Mekong Digital",
    });
    expect(
      a("MESSAGE_RECEIVED", "New message", 'QA at Acme: "Can we talk at 3?"')
    ).toEqual({
      title: "Tin nhắn mới",
      body: "QA tại Acme: “Can we talk at 3?”",
    });
    expect(
      a("INTERVIEW_PROPOSED", "Interview proposed", "QA at Acme").title
    ).toBe("Lịch phỏng vấn được đề xuất");
    expect(
      a("INTERVIEW_CONFIRMED", "Interview confirmed", "QA at Acme").title
    ).toBe("Đã xác nhận lịch phỏng vấn");
    expect(
      a(
        "INVITATION_RECEIVED",
        "Job invitation",
        "Go Engineer at Acme invited you to apply"
      )
    ).toEqual({
      title: "Lời mời ứng tuyển",
      body: "Acme mời bạn ứng tuyển vị trí Go Engineer",
    });
  });

  it("falls back to the original text when it cannot parse it", () => {
    expect(
      a("APPLICATION_STATUS_CHANGED", "Offer extended", "no company here")
    ).toEqual({
      title: "Offer extended",
      body: "no company here",
    });
  });
});
