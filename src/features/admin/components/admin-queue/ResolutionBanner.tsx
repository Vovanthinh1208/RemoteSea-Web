import { Ban, Check, RefreshCw } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export type ResolutionKind = "approved" | "changes" | "rejected";

interface ResolutionBannerProps {
  banner: { id: string; kind: ResolutionKind } | null;
  jobId: string;
}

const BANNER_CLASS: Record<ResolutionKind, string> = {
  approved: "bg-brand-600 text-white",
  changes: "bg-amber-500 text-white",
  rejected: "bg-red-600 text-white",
};

const BANNER_ICON: Record<ResolutionKind, React.ReactNode> = {
  approved: <Check size={16} />,
  changes: <RefreshCw size={16} />,
  rejected: <Ban size={16} />,
};

export const ResolutionBanner = ({ banner, jobId }: ResolutionBannerProps) => {
  const { t } = useTranslation("admin");
  if (!banner || banner.id !== jobId) return null;

  return (
    <div
      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium ${BANNER_CLASS[banner.kind]}`}
    >
      {BANNER_ICON[banner.kind]}
      {t(`banner.${banner.kind}`)}
    </div>
  );
};
