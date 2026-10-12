import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n";

export const NotFoundPage = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("notFound.title"));

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-6xl italic text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
        {t("notFound.title")}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">{t("notFound.desc")}</p>
      <Link className="mt-6" to={ROUTES.home}>
        <Button variant="primary">{t("notFound.backHome")}</Button>
      </Link>
    </div>
  );
};
