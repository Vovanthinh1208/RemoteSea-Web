import { GradientInitial } from "@/components/ui/gradient-initial";
import { VerifiedInline } from "@/components/shared/VerifiedInline";

interface CompanyCardProps {
  company: { companyName: string; isVerified: boolean; hqCountry: string | null };
}

export const CompanyCard = ({ company }: CompanyCardProps) => (
  <div className="rounded-20 border border-neutral-100 bg-white p-5">
    <div className="mb-4 flex items-center gap-3">
      <GradientInitial className="h-12 w-12 rounded-12 text-[18px]">
        {company.companyName.charAt(0).toUpperCase()}
      </GradientInitial>
      <div>
        <p className="text-[15px] font-semibold text-neutral-900">{company.companyName}</p>
        <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
          {company.isVerified && <VerifiedInline />}
          {company.hqCountry && <span>· {company.hqCountry}</span>}
        </div>
      </div>
    </div>
  </div>
);
