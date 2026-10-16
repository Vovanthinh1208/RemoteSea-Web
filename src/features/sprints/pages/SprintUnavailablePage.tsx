import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/utils/cn";
import type { RouteSprint } from "../sprint-routes";

interface SprintUnavailablePageProps {
  sprint: RouteSprint | null;
  focus: ReadonlySet<number> | null;
}

// Rendered in place of a screen that belongs to a sprint hidden by
// VITE_SPRINT_FOCUS. The route itself is untouched — this only stands in for it.
export const SprintUnavailablePage = ({
  sprint,
  focus,
}: SprintUnavailablePageProps) => {
  const { t } = useTranslation("sprints");
  useDocumentTitle(t("unavailable.title"));
  const focusLabel = [...(focus ?? [])].sort((a, b) => a - b).join(", ");

  return (
    <div className="mx-auto max-w-[560px] px-4 py-16 sm:px-6">
      <Card className="p-8 text-center">
        <h1 className="text-[22px] font-semibold text-neutral-900">
          {t("unavailable.title")}
        </h1>
        <p className="mt-3 text-[14px] text-neutral-600">
          {sprint === "unassigned" || sprint === null
            ? t("unavailable.descUnassigned", { focus: focusLabel })
            : t("unavailable.descSprint", { sprint, focus: focusLabel })}
        </p>
        <p className="mt-2 text-[13px] text-neutral-500">
          {t("unavailable.restore")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link className={cn(buttonVariants({ size: "md" }))} to={ROUTES.home}>
            {t("unavailable.home")}
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "soft", size: "md" }))}
            to={ROUTES.settings}
          >
            {t("unavailable.settings")}
          </Link>
        </div>
      </Card>
    </div>
  );
};
