import { useSearchParams } from "react-router-dom";
import { TalentSearchBoard } from "@/features/employer/talent-search/components/TalentSearchBoard";
import {
  parseTalentSearchQuery,
  serializeTalentSearchQuery,
  type TalentSearchFilters,
} from "@/features/employer/talent-search/talent-search.filters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const TalentSearchPage = () => {
  const { t } = useTranslation("employer");
  useDocumentTitle(t("search.docTitle"), t("search.docDesc"));
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseTalentSearchQuery(searchParams);

  const handleFiltersChange = (next: TalentSearchFilters) => {
    setSearchParams(serializeTalentSearchQuery(next));
  };

  return (
    <TalentSearchBoard
      filters={filters}
      onFiltersChange={handleFiltersChange}
    />
  );
};
