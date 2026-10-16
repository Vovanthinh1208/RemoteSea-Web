import { cn } from "@/utils/cn";
import { TIER_BADGE_CLASS } from "@/utils/color";
import type { NoticePeriod } from "@/types/talent";
import { useTranslation } from "@/i18n/useTranslation";

interface AvailabilityBadgeProps {
  isOpenToWork: boolean;
  noticePeriod: NoticePeriod | null;
  className?: string;
}

const NOTICE_PERIOD_LABEL_KEY: Record<NoticePeriod, string> = {
  Immediate: "talent.availability.now",
  "2 weeks": "talent.availability.2weeks",
  "1 month": "talent.availability.1month",
  "2+ months": "talent.availability.2months",
};

const NOTICE_PERIOD_TIER: Record<NoticePeriod, keyof typeof TIER_BADGE_CLASS> =
  {
    Immediate: "high",
    "2 weeks": "mid",
    "1 month": "low",
    "2+ months": "low",
  };

export const AvailabilityBadge = ({
  isOpenToWork,
  noticePeriod,
  className,
}: AvailabilityBadgeProps) => {
  const { t } = useTranslation();
  if (!isOpenToWork) return null;

  const label = noticePeriod
    ? t(NOTICE_PERIOD_LABEL_KEY[noticePeriod])
    : t("talent.availability.open");
  const tier = noticePeriod
    ? TIER_BADGE_CLASS[NOTICE_PERIOD_TIER[noticePeriod]]
    : TIER_BADGE_CLASS.mid;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
        tier,
        className
      )}
    >
      {label}
    </span>
  );
};
