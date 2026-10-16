import { TalentDashboard } from "@/features/talent/components/TalentDashboard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const TalentDashboardPage = () => {
  const { t } = useTranslation("talent");
  useDocumentTitle(t("dashboard.docTitle"));
  return <TalentDashboard />;
};
