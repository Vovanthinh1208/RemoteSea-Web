import { useId, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useUpdateJob } from "@/features/jobs/jobs.queries";
import { useCreateCheckoutSession } from "@/features/billing/billing.queries";
import { TIERS } from "@/features/post-job/post-job.schemas";
import { getErrorMessage } from "@/core/errors/localize";
import { reportError } from "@/services/monitoring";
import { formatUsd } from "@/utils/format";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";
import type { EmployerJobListItem } from "@/types/employer";
import type { PlanType } from "@/types/job";

interface PayDraftDialogProps {
  job: EmployerJobListItem;
  open: boolean;
  onClose: () => void;
}

// PB43 AC1–3: an OWNER pays for a DRAFT that already exists (saved earlier,
// edited via PB42, or left after an abandoned checkout) without going back
// through the wizard, which would create a second job.
export const PayDraftDialog = ({ job, open, onClose }: PayDraftDialogProps) => {
  const { t } = useTranslation("employer");
  const { toast } = useToast();
  const groupName = useId();
  const [plan, setPlan] = useState<PlanType>(job.planType);
  const updateJobMutation = useUpdateJob();
  const checkoutMutation = useCreateCheckoutSession();
  const busy = updateJobMutation.isPending || checkoutMutation.isPending;

  const handlePay = async (): Promise<void> => {
    try {
      // Checkout prices the job's stored plan, so a changed choice is saved
      // first.
      if (plan !== job.planType) {
        await updateJobMutation.mutateAsync({
          id: job.id,
          payload: { planType: plan },
        });
      }
      const { url } = await checkoutMutation.mutateAsync(job.id);
      if (url) {
        window.location.assign(url);
        return;
      }
      // Stripe isn't configured on this deployment: the job stays an unpaid
      // DRAFT, so say that rather than implying it was published.
      toast({ variant: "info", title: t("listings.payUnavailable") });
      onClose();
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: t("listings.payFailed"),
        description: getErrorMessage(err),
      });
    }
  };

  return (
    <ConfirmDialog
      cancelLabel={t("listings.payCancel")}
      confirmDisabled={busy}
      confirmLabel={busy ? t("listings.payStarting") : t("listings.payConfirm")}
      description={t("listings.payDescription", { title: job.title })}
      open={open}
      title={t("listings.payTitle")}
      onCancel={onClose}
      onConfirm={() => void handlePay()}
    >
      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">{t("listings.payPlan")}</legend>
        {TIERS.map((tier) => (
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-12 border p-3 text-left transition-colors",
              plan === tier.planType
                ? "border-brand-500 bg-brand-50"
                : "border-neutral-200 hover:border-neutral-300"
            )}
            key={tier.id}
          >
            <input
              checked={plan === tier.planType}
              className="mt-1"
              name={groupName}
              type="radio"
              value={tier.planType}
              onChange={() => setPlan(tier.planType)}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-medium text-neutral-900">
                  {t(`postjob.tier.${tier.id}.name`)}
                </span>
                <span className="text-[13px] font-semibold text-neutral-900">
                  {formatUsd(tier.price)}
                </span>
              </span>
              <span className="block text-[12px] text-neutral-500">
                {t(`postjob.tier.${tier.id}.desc`)}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
    </ConfirmDialog>
  );
};
