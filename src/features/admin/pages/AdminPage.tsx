import { AdminConsole } from "@/features/admin/components/AdminConsole";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const AdminPage = () => {
  const { t } = useTranslation("admin");
  useDocumentTitle(t("console.docTitle"));
  return <AdminConsole />;
};
