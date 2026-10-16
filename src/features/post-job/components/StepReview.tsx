import { Shield } from "lucide-react";
import {
  TIERS,
  type PostJobFormState,
} from "@/features/post-job/post-job.schemas";
import { formatUsd } from "@/utils/format";
import { useTranslation } from "@/i18n/useTranslation";

interface StepReviewProps {
  form: PostJobFormState;
}

// Actual payment happens on Stripe's hosted Checkout page after "Pay & publish" —
// there's no real card-collection endpoint on the backend, so this step is a plain
// review + redirect rather than a (non-functional) credit card form.
export const StepReview = ({ form }: StepReviewProps) => {
  const { t } = useTranslation("postjob");
  const tier = TIERS.find((item) => item.id === form.tier) ?? TIERS[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-semibold text-neutral-900">
          {t("review.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">{t("review.subtitle")}</p>
      </div>

      <div className="rounded-16 border border-neutral-100 bg-neutral-50 p-5">
        <div className="space-y-2 text-[13.5px]">
          <div className="flex justify-between text-neutral-600">
            <span>{form.jobTitle || t("review.untitled")}</span>
            <span>{form.coName || t("review.yourCompany")}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
            <span>
              {t("review.listing", { name: t(`tier.${tier.id}.name`) })}
            </span>
            <span>{formatUsd(tier.price)}</span>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-neutral-400">
          <Shield className="text-brand-500" size={11} />
          {t("review.secured")}
        </p>
      </div>
    </div>
  );
};
