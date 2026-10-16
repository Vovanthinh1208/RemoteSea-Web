import { useSearchParams } from "react-router-dom";
import { JobsBoard } from "@/features/jobs/components/JobsBoard";
import {
  parseJobQuery,
  serializeJobQuery,
  type JobFilters,
} from "@/features/jobs/job-filters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const JobsPage = () => {
  const { t } = useTranslation("jobs");
  useDocumentTitle(t("page.docTitle"), t("page.description"));
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseJobQuery(searchParams);

  const handleFiltersChange = (next: JobFilters) => {
    setSearchParams(serializeJobQuery(next));
  };

  return <JobsBoard filters={filters} onFiltersChange={handleFiltersChange} />;
};
