import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  const { t } = useTranslation();
  return (
    <div
      aria-label={t("common.a11y.loading")}
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-600",
        className
      )}
      role="status"
    />
  );
};

export const FullPageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner className="h-8 w-8" />
  </div>
);
