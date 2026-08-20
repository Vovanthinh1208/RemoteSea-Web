import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getInterview } from "@/features/interviews/interview.service";
import { getScorecards } from "@/features/scorecards/scorecard.service";
import { useTeamMembers } from "@/features/team/team.queries";
import { countEligibleReviewers } from "@/features/scorecards/scorecard.utils";
import { interviewKeys, scorecardKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";
import type { ApplicantWithJob } from "@/features/employer/employer.queries";
import type { Interview } from "@/types/interview";
import type { Scorecard, ScorecardSummary } from "@/types/scorecard";

export interface ApplicantHiringSignal {
  interview: Interview | null;
  scorecards: Scorecard[];
  scorecardSummary: ScorecardSummary | undefined;
  eligibleReviewerCount: number;
}

// Bounded fan-out — only for applicants who've actually reached the
// INTERVIEW stage (typically a small slice of a job's applicant list), same
// useQueries pattern useEmployerApplicationsAggregate already uses to fetch
// per-job application pages. Shares query keys with useInterview/
// useScorecards, so clicking from a row into the full workspace page for
// one of these applicants is an instant cache hit, not a second fetch.
export const useApplicantHiringSignals = (
  applicants: ApplicantWithJob[]
): Map<string, ApplicantHiringSignal> => {
  const { user } = useAuth();
  const { data: teamMembers } = useTeamMembers();

  const interviewStage = useMemo(
    () => applicants.filter((a) => a.status === "INTERVIEW"),
    [applicants]
  );

  const interviewResults = useQueries({
    queries: interviewStage.map((a) => ({
      queryKey: interviewKeys.detail(a.id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getInterview(a.id, user!.role, { signal }),
      enabled: !!user,
      ...TIER.list,
    })),
  });
  const scorecardResults = useQueries({
    queries: interviewStage.map((a) => ({
      queryKey: scorecardKeys.list(a.id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getScorecards(a.id, { signal }),
      enabled: !!user,
      ...TIER.live,
    })),
  });

  const interviewVersion = interviewResults
    .map((r) => r.dataUpdatedAt)
    .join(",");
  const scorecardVersion = scorecardResults
    .map((r) => r.dataUpdatedAt)
    .join(",");

  return useMemo(() => {
    const map = new Map<string, ApplicantHiringSignal>();
    interviewStage.forEach((a, i) => {
      const interview = interviewResults[i]?.data?.interview ?? null;
      const scorecardSummary = scorecardResults[i]?.data?.summary;
      const scorecards = scorecardResults[i]?.data?.scorecards ?? [];
      map.set(a.id, {
        interview,
        scorecards,
        scorecardSummary,
        eligibleReviewerCount: countEligibleReviewers(
          teamMembers ?? [],
          interview?.interviewerId
        ),
      });
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewStage, teamMembers, interviewVersion, scorecardVersion]);
};
