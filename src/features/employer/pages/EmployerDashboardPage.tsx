import { EmployerDashboard } from "@/features/employer/components/EmployerDashboard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const EmployerDashboardPage = () => {
  const { t } = useTranslation("employer");
  useDocumentTitle(t("dash.docTitle"));
  return <EmployerDashboard />;
};
