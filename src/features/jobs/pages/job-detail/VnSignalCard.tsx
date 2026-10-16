import { useTranslation } from "@/i18n/useTranslation";
interface VnSignalCardProps {
  vnHireCount: number;
  companyName: string;
}

export const VnSignalCard = ({
  vnHireCount,
  companyName,
}: VnSignalCardProps) => {
  const { t } = useTranslation("jobs");
  if (vnHireCount === 0) return null;

  return (
    <div className="flex gap-3 rounded-16 border border-neutral-100 bg-white p-5">
      <span className="text-[28px]">🇻🇳</span>
      <div>
        <h5 className="mb-1 text-[13px] font-semibold text-neutral-900">
          {t("detail.vnSignalTitle", {
            count: vnHireCount,
            company: companyName,
          })}
        </h5>
        <p className="text-[12px] leading-relaxed text-neutral-500">
          {t("detail.vnSignalDesc")}
        </p>
      </div>
    </div>
  );
};
