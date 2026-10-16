import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { Button } from "@/components/ui/button";
import { useUpdateApplicationStatus } from "@/features/employer/employer.queries";
import { useToastMutation } from "@/hooks/useToastMutation";
import type { ScorecardSummary } from "@/types/scorecard";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation("employer");
  const updateStatus = useUpdateApplicationStatus();
  const runWithToast = useToastMutation();

  const decide = async (status: "OFFERED" | "REJECTED"): Promise<void> => {
    await runWithToast(
      () => updateStatus.mutateAsync({ id: applicationId, jobId, status }),
      {
        success:
          status === "OFFERED"
            ? t("decision.offered", { name: talentName })
            : t("decision.rejected", { name: talentName }),
        error: t("decision.failed"),
      }
    );
  };

  return (
    <div
      className="space-y-3 rounded-16 border border-neutral-100 bg-white p-4"
      id="hiring-decision"
    >
      <h3 className="text-[13.5px] font-medium text-neutral-900">
        {t("decision.title")}
      </h3>
      <p className="text-[12.5px] text-neutral-600">
        {t("decision.summary", {
          hire: summary.hireCount,
          total: summary.total,
        })}
      </p>
      <div className="flex gap-2 pt-1">
        <ConfirmAction
          confirmLabel={t("decision.extend")}
          message={t("decision.extendQ", { name: talentName })}
          pendingLabel={t("decision.extending")}
          onConfirm={() => decide("OFFERED")}
        >
          {({ onClick }) => (
            <Button className="flex-1" type="button" onClick={onClick}>
              {t("decision.extend")}
            </Button>
          )}
        </ConfirmAction>
        <ConfirmAction
          confirmLabel={t("decision.reject")}
          message={t("decision.rejectQ", { name: talentName })}
          pendingLabel={t("decision.rejecting")}
          onConfirm={() => decide("REJECTED")}
        >
          {({ onClick }) => (
            <Button
              className="flex-1"
              type="button"
              variant="danger"
              onClick={onClick}
            >
              {t("decision.reject")}
            </Button>
          )}
        </ConfirmAction>
      </div>
    </div>
  );
};
