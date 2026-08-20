import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { Button } from "@/components/ui/button";
import { useUpdateApplicationStatus } from "@/features/employer/employer.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import type { ScorecardSummary } from "@/types/scorecard";

interface HiringDecisionCardProps {
  applicationId: string;
  jobId: string;
  talentName: string;
  summary: ScorecardSummary;
}

export const HiringDecisionCard = ({
  applicationId,
  jobId,
  talentName,
  summary,
}: HiringDecisionCardProps) => {
  const updateStatus = useUpdateApplicationStatus();
  const runWithToast = useToastMutation();

  const decide = async (status: "OFFERED" | "REJECTED"): Promise<void> => {
    await runWithToast(
      () => updateStatus.mutateAsync({ id: applicationId, jobId, status }),
      {
        success:
          status === "OFFERED"
            ? `Offer extended to ${talentName}.`
            : `${talentName}'s application was rejected.`,
        error: "Couldn't update the application. Please try again.",
      }
    );
  };

  return (
    <div
      className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4"
      id="hiring-decision"
    >
      <h3 className="text-[13.5px] font-medium text-neutral-900">
        Team decision
      </h3>
      <p className="text-[12.5px] text-neutral-600">
        {summary.hireCount}/{summary.total} recommend hire. All required
        feedback has been submitted.
      </p>
      <div className="flex gap-2 pt-1">
        <ConfirmAction
          confirmLabel="Extend offer"
          message={`Extend an offer to ${talentName}?`}
          pendingLabel="Extending…"
          onConfirm={() => decide("OFFERED")}
        >
          {({ onClick }) => (
            <Button className="flex-1" type="button" onClick={onClick}>
              Extend offer
            </Button>
          )}
        </ConfirmAction>
        <ConfirmAction
          confirmLabel="Reject"
          message={`Reject ${talentName}'s application?`}
          pendingLabel="Rejecting…"
          onConfirm={() => decide("REJECTED")}
        >
          {({ onClick }) => (
            <Button
              className="flex-1"
              type="button"
              variant="outline"
              onClick={onClick}
            >
              Reject
            </Button>
          )}
        </ConfirmAction>
      </div>
    </div>
  );
};
