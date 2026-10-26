import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { GradientInitial } from "@/components/ui/gradient-initial";
import { VerifiedInline } from "@/components/shared/VerifiedInline";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

interface CompanyCardProps {
  company: {
    companyName: string;
    isVerified: boolean;
    hqCountry: string | null;
  };
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
  const { t } = useTranslation("employer");
  return (
    <div className="rounded-20 border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <GradientInitial className="h-12 w-12 rounded-12 text-[18px]">
          {company.companyName.charAt(0).toUpperCase()}
        </GradientInitial>
        <div>
          <p className="text-[15px] font-semibold text-neutral-900">
            {company.companyName}
          </p>
          <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
            {company.isVerified && <VerifiedInline />}
            {company.hqCountry && <span>· {company.hqCountry}</span>}
          </div>
        </div>
      </div>
      {/* PB31 entry point: Cài đặt công ty. */}
      <Link
        className="flex items-center justify-center gap-1.5 rounded-12 border border-neutral-200 py-2 text-[12.5px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-800"
        to={ROUTES.companySettings}
      >
        <Settings size={12} /> {t("companySettings.title")}
      </Link>
    </div>
  );
};
