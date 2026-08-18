import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";

interface PartyNames {
  employerName: string;
  talentName: string | null;
}

// Shared by every per-application detail page (messages, interviews, ...):
// resolves which "other party" name to show as the page title and which
// dashboard "back" points at, both driven by the viewer's own role rather
// than the application — and sets the document title as a side effect.
// Previously duplicated verbatim between MessageThreadPage and InterviewPage.
export const useApplicationHeaderContext = (
  data: PartyNames | undefined,
  loadingTitle: string
) => {
  const { user } = useAuth();
  const isEmployerViewer = user?.role === "EMPLOYER";
  const backHref = isEmployerViewer ? ROUTES.employerDashboard : ROUTES.talent;
  const title = isEmployerViewer
    ? (data?.talentName ?? "Candidate")
    : (data?.employerName ?? "Employer");
  useDocumentTitle(data ? title : loadingTitle);

  return { isEmployerViewer, backHref, title };
};
