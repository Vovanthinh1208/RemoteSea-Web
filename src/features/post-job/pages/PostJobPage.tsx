import { PostJobWizard } from "@/features/post-job/components/PostJobWizard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const PostJobPage = () => {
  const { t } = useTranslation("postjob");
  useDocumentTitle(t("page.docTitle"));
  return <PostJobWizard />;
};
