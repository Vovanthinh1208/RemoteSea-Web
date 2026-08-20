import type { ApplicantWithJob } from "@/features/employer/employer.queries";
import type { Interview } from "@/types/interview";
import type { Scorecard } from "@/types/scorecard";

export interface ActivityEvent {
  id: string;
  label: string;
  at: string;
}

const RECOMMENDATION_LABEL: Record<Scorecard["recommendation"], string> = {
  STRONG_YES: "strong yes",
  YES: "yes",
  NO: "no",
  STRONG_NO: "strong no",
};

export const buildActivityEvents = (
  applicant: ApplicantWithJob,
  interview: Interview | null | undefined,
  scorecards: Scorecard[]
): ActivityEvent[] => {
  const events: ActivityEvent[] = [
    {
      id: "applied",
      label: "Candidate applied",
      at: applicant.appliedAt,
    },
  ];

  if (applicant.viewedAt) {
    events.push({
      id: "viewed",
      label: "Viewed by your team",
      at: applicant.viewedAt,
    });
  }

  if (interview) {
    events.push({
      id: `interview-proposed-${interview.id}`,
      label: "Interview times proposed",
      at: interview.createdAt,
    });
    if (interview.status === "CONFIRMED" && interview.confirmedSlot) {
      events.push({
        id: `interview-confirmed-${interview.id}`,
        label: "Interview confirmed",
        at: interview.confirmedSlot,
      });
    }
  }

  for (const scorecard of scorecards) {
    events.push({
      id: `scorecard-${scorecard.id}`,
      label: `${scorecard.author.name ?? "A team member"} submitted feedback (${RECOMMENDATION_LABEL[scorecard.recommendation]})`,
      at: scorecard.createdAt,
    });
  }

  return events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
};
