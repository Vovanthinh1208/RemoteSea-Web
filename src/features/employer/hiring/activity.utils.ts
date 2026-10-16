import type { ApplicantWithJob } from "@/features/employer/employer.queries";
import type { Interview } from "@/types/interview";
import type { Scorecard } from "@/types/scorecard";
import { translate } from "@/i18n/runtime";

export interface ActivityEvent {
  id: string;
  label: string;
  at: string;
}

export const buildActivityEvents = (
  applicant: ApplicantWithJob,
  interview: Interview | null | undefined,
  scorecards: Scorecard[]
): ActivityEvent[] => {
  const events: ActivityEvent[] = [
    {
      id: "applied",
      label: translate("employer.activity.applied"),
      at: applicant.appliedAt,
    },
  ];

  if (applicant.viewedAt) {
    events.push({
      id: "viewed",
      label: translate("employer.activity.viewed"),
      at: applicant.viewedAt,
    });
  }

  if (interview) {
    events.push({
      id: `interview-proposed-${interview.id}`,
      label: translate("employer.activity.proposed"),
      at: interview.createdAt,
    });
    if (interview.status === "CONFIRMED" && interview.confirmedSlot) {
      events.push({
        id: `interview-confirmed-${interview.id}`,
        label: translate("employer.activity.confirmed"),
        at: interview.confirmedSlot,
      });
    }
  }

  for (const scorecard of scorecards) {
    events.push({
      id: `scorecard-${scorecard.id}`,
      label: translate("employer.activity.feedback", {
        name:
          scorecard.author.name ?? translate("employer.activity.teamMember"),
        rec: translate(`employer.rec.${scorecard.recommendation}`),
      }),
      at: scorecard.createdAt,
    });
  }

  return events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
};
