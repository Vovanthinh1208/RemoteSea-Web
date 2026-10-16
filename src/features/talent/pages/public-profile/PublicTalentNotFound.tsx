import { Link } from "react-router-dom";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

export const PublicTalentNotFound = () => {
  const { t } = useTranslation("talent");
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400">
        <UserX size={20} />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900">
        {t("public.notFoundTitle")}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {t("public.notFoundDesc")}
      </p>
      <Link className="mt-6" to={ROUTES.jobs}>
        <Button variant="primary">{t("public.browseJobs")}</Button>
      </Link>
    </div>
  );
};
