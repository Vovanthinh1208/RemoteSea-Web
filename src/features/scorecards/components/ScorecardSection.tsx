import { useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useScorecards } from "@/features/scorecards/scorecard.queries";
import { ScorecardForm } from "@/features/scorecards/components/ScorecardForm";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScorecardRecommendation } from "@/types/scorecard";

const RECOMMENDATION_LABELS: Record<ScorecardRecommendation, string> = {
  STRONG_YES: "Strong yes",
  YES: "Yes",
  NO: "No",
  STRONG_NO: "Strong no",
};

const RECOMMENDATION_VARIANTS: Record<ScorecardRecommendation, BadgeVariant> = {
  STRONG_YES: "success",
  YES: "positive",
  NO: "warning",
  STRONG_NO: "warning",
};

const SCORECARD_SKELETON_COUNT = 2;

// Shape-matched (header row + item rows), not one generic block — same
// reasoning as ReviewsSectionSkeleton/TeamMembersSection's MemberRowSkeleton.
const ScorecardSectionSkeleton = () => (
  <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3.5 w-24" />
    </div>
    <div className="space-y-2.5">
      {Array.from({ length: SCORECARD_SKELETON_COUNT }, (_, i) => (
        <div
          className="space-y-1.5 rounded-10 border border-neutral-100 bg-neutral-50 px-3.5 py-2.5"
          key={i}
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

interface ScorecardSectionProps {
  applicationId: string;
  talentName: string;
  // Mirrors the backend's own eligibility rule (ScorecardsService.isEligible):
  // CONFIRMED and the confirmed slot has already passed. This component is
  // only ever mounted once status is CONFIRMED (see InterviewPage), so this
  // prop just carries the "has it actually happened yet" half of that rule.
  interviewOccurred: boolean;
}

export const ScorecardSection = ({
  applicationId,
  talentName,
  interviewOccurred,
}: ScorecardSectionProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useScorecards(applicationId);

  if (isLoading) {
    return <ScorecardSectionSkeleton />;
  }

  // A failed fetch gets a retry affordance, same as TeamMembersSection,
  // ReviewsSection, and InviteMemberSection's PendingInvitationsList —
  // hiding it outright would be indistinguishable from "no feedback yet"
  // and silently swallow a real error.
  if (isError || !data) {
    return (
      <div className="flex items-center justify-between rounded-16 border border-neutral-100 bg-white px-4 py-3.5 text-[12.5px] text-neutral-400">
        Couldn't load team feedback.
        <button
          className="inline-flex items-center gap-1 font-medium text-brand-600 transition-colors hover:text-brand-700"
          type="button"
          onClick={() => refetch()}
        >
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    );
  }

  const alreadySubmitted = data.scorecards.some(
    (scorecard) => scorecard.authorId === user?.id
  );

  // Nothing submitted yet and the caller can't add anything yet either —
  // zero scorecards isn't an error, so this renders nothing rather than an
  // empty shell, same restraint as ReviewCTA returning null when !eligible.
  if (data.scorecards.length === 0 && !interviewOccurred) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Users className="flex-shrink-0 text-neutral-400" size={15} />
          <h3 className="text-[13.5px] font-medium text-neutral-900">
            Team feedback
          </h3>
        </div>
        {data.summary.total > 0 && (
          <span className="flex-shrink-0 text-[12px] text-neutral-500">
            {data.summary.hireCount}/{data.summary.total} recommend hire
          </span>
        )}
      </div>

      {data.scorecards.length > 0 && (
        <ul className="space-y-2">
          {data.scorecards.map((scorecard) => (
            <li
              className="rounded-10 border border-neutral-100 bg-neutral-50 px-3.5 py-2.5"
              key={scorecard.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[12.5px] font-medium text-neutral-800">
                  {scorecard.author.name ?? "Team member"}
                </span>
                <Badge
                  className="flex-shrink-0"
                  variant={RECOMMENDATION_VARIANTS[scorecard.recommendation]}
                >
                  {RECOMMENDATION_LABELS[scorecard.recommendation]}
                </Badge>
              </div>
              {scorecard.note && (
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-600">
                  {scorecard.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {!alreadySubmitted && interviewOccurred && (
        <div
          className={
            data.scorecards.length > 0
              ? "border-t border-neutral-100 pt-3"
              : undefined
          }
        >
          {open ? (
            <ScorecardForm
              applicationId={applicationId}
              talentName={talentName}
              onCancel={() => setOpen(false)}
              onSuccess={() => setOpen(false)}
            />
          ) : (
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
            >
              Add feedback
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
