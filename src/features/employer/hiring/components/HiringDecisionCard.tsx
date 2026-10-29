import { useState, type FormEvent } from "react";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { FieldError } from "@/components/shared/FieldError";
import {
  TEXT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { Button } from "@/components/ui/button";
import { useUpdateApplicationStatus } from "@/features/employer/employer.queries";
import type { OfferDetailsDto } from "@/features/employer/employer.dto";
import { useToastMutation } from "@/hooks/useToastMutation";
import type { ScorecardSummary } from "@/types/scorecard";
import { useTranslation } from "@/i18n/useTranslation";

interface HiringDecisionCardProps {
  applicationId: string;
  jobId: string;
  talentName: string;
  summary: ScorecardSummary;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

// PB56 AC1–2: an offer always reaches the talent with salary, benefits and a
// proposed start date (the API refuses OFFERED without them).
const OfferForm = ({
  isPending,
  onCancel,
  onSubmit,
}: {
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (offer: OfferDetailsDto) => Promise<void>;
}) => {
  const { t } = useTranslation("employer");
  const [salary, setSalary] = useState("");
  const [benefits, setBenefits] = useState("");
  const [startDate, setStartDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    salary: !salary.trim() ? t("decision.offerRequired") : undefined,
    benefits: !benefits.trim() ? t("decision.offerRequired") : undefined,
    startDate: !startDate
      ? t("decision.offerRequired")
      : startDate < todayIso()
        ? t("decision.startPast")
        : undefined,
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.salary || errors.benefits || errors.startDate) return;
    await onSubmit({
      salary: salary.trim(),
      benefits: benefits.trim(),
      startDate,
    });
  };

  return (
    <form
      noValidate
      aria-label={t("decision.offerForm")}
      className="space-y-3 rounded-12 border border-brand-100 bg-brand-50/40 p-3"
      onSubmit={handleSubmit}
    >
      <div>
        <label
          className="mb-1 block text-[12.5px] font-medium text-neutral-700"
          htmlFor="offer-salary"
        >
          {t("decision.salary")}
        </label>
        <input
          className={TEXT_INPUT_CLASS}
          id="offer-salary"
          maxLength={120}
          placeholder={t("decision.salaryPlaceholder")}
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
        {submitted && <FieldError message={errors.salary} />}
      </div>
      <div>
        <label
          className="mb-1 block text-[12.5px] font-medium text-neutral-700"
          htmlFor="offer-benefits"
        >
          {t("decision.benefits")}
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="offer-benefits"
          maxLength={2000}
          placeholder={t("decision.benefitsPlaceholder")}
          rows={3}
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
        />
        {submitted && <FieldError message={errors.benefits} />}
      </div>
      <div>
        <label
          className="mb-1 block text-[12.5px] font-medium text-neutral-700"
          htmlFor="offer-start"
        >
          {t("decision.startDate")}
        </label>
        <input
          className={TEXT_INPUT_CLASS}
          id="offer-start"
          min={todayIso()}
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {submitted && <FieldError message={errors.startDate} />}
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isPending}
          isLoading={isPending}
          type="submit"
        >
          {t("decision.sendOffer")}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </form>
  );
};

export const HiringDecisionCard = ({
  applicationId,
  jobId,
  talentName,
  summary,
}: HiringDecisionCardProps) => {
  const { t } = useTranslation("employer");
  const updateStatus = useUpdateApplicationStatus();
  const runWithToast = useToastMutation();
  const [offering, setOffering] = useState(false);

  const extendOffer = async (offer: OfferDetailsDto): Promise<void> => {
    const ok = await runWithToast(
      () =>
        updateStatus.mutateAsync({
          id: applicationId,
          jobId,
          status: "OFFERED",
          offer,
        }),
      {
        success: t("decision.offered", { name: talentName }),
        error: t("decision.failed"),
      }
    );
    if (ok) setOffering(false);
  };

  // PB58 BR2: optional feedback that the talent will see.
  const reject = async (reason?: string): Promise<void> => {
    await runWithToast(
      () =>
        updateStatus.mutateAsync({
          id: applicationId,
          jobId,
          status: "REJECTED",
          reason,
        }),
      {
        success: t("decision.rejected", { name: talentName }),
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
      {offering ? (
        <OfferForm
          isPending={updateStatus.isPending}
          onCancel={() => setOffering(false)}
          onSubmit={extendOffer}
        />
      ) : (
        <div className="flex gap-2 pt-1">
          <Button
            className="flex-1"
            type="button"
            onClick={() => setOffering(true)}
          >
            {t("decision.extend")}
          </Button>
          <ConfirmAction
            confirmLabel={t("decision.reject")}
            message={t("decision.rejectQ", { name: talentName })}
            noteLabel={t("decision.rejectReason")}
            notePlaceholder={t("decision.rejectReasonPlaceholder")}
            pendingLabel={t("decision.rejecting")}
            onConfirm={reject}
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
      )}
    </div>
  );
};
