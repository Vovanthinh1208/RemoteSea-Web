import { useSearchParams } from "react-router-dom";
import { TalentSearchBoard } from "@/features/employer/talent-search/components/TalentSearchBoard";
import {
  parseTalentSearchQuery,
  serializeTalentSearchQuery,
  type TalentSearchFilters,
} from "@/features/employer/talent-search/talent-search.filters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const TalentSearchPage = () => {
  useDocumentTitle(
    "Find Talent",
    "Search the RemoteSEA talent pool by skill, seniority, and timezone — only candidates who've opted into Open to work."
  );
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
