import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  TIERS,
  type PostJobStepProps,
} from "@/features/post-job/post-job.schemas";
import { formatUsd } from "@/utils/format";
import { useTranslation } from "@/i18n/useTranslation";

export const StepPlan = ({ form, set }: PostJobStepProps) => {
  const { t } = useTranslation("postjob");
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-semibold text-neutral-900">
          {t("plan.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">{t("plan.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <button
            className={cn(
              "relative rounded-20 border p-5 text-left transition-all focus-visible:shadow-focus focus-visible:outline-none",
              form.tier === tier.id
                ? "border-brand-600 bg-brand-50 shadow-card"
                : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-card"
            )}
            key={tier.id}
            type="button"
            onClick={() => set("tier", tier.id)}
          >
            {tier.hasRibbon && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10.5px] font-bold text-white">
                {t(`tier.${tier.id}.ribbon`)}
              </span>
            )}
            {form.tier === tier.id && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                <Check size={11} />
              </span>
            )}
            <p className="mb-1 text-[15px] font-semibold text-neutral-900">
              {t(`tier.${tier.id}.name`)}
            </p>
            <p className="mb-3 text-[22px] font-semibold text-neutral-900">
              {/* toLocaleString for the thousands separator — the Hands-on tier is
                $1,200; the pricing page and salary figures format the same way. */}
              {formatUsd(tier.price)}
              <span className="ml-0.5 text-[13px] font-normal text-neutral-400">
                {t("plan.oneTime")}
              </span>
            </p>
            <p className="mb-3 text-[12.5px] leading-relaxed text-neutral-500">
              {t(`tier.${tier.id}.desc`)}
            </p>
            <ul className="space-y-1.5">
              {Array.from({ length: tier.featureCount }, (_, n) => n + 1).map(
                (n) => (
                  <li
                    className="flex items-center gap-2 text-[12px] text-neutral-600"
                    key={n}
                  >
                    <Check className="flex-shrink-0 text-brand-600" size={11} />
                    {t(`tier.${tier.id}.f${n}`)}
                  </li>
                )
              )}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
};
