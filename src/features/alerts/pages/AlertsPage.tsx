import { AlertsManager } from "@/features/alerts/components/AlertsManager";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const AlertsPage = () => {
  const { t } = useTranslation("alerts");
  useDocumentTitle(t("page.docTitle"));
  return <AlertsManager />;
};
